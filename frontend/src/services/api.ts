import { Platform } from 'react-native';
import {
  HEALTH_ENDPOINT,
  DETECT_INGREDIENTS_ENDPOINT,
  DETECT_INGREDIENTS_BASE64_ENDPOINT,
  RECOMMENDATIONS_ENDPOINT,
} from '../config';
import {
  HealthResponse,
  Ingredient,
  DetectIngredientsResponse,
  DetectedIngredientItem,
  RecipeRecommendation,
  RecommendationResponse,
} from '../types';

export type {
  HealthResponse,
  Ingredient,
  DetectIngredientsResponse,
  DetectedIngredientItem,
  RecipeRecommendation,
  RecommendationResponse,
};

/**
 * Memeriksa status koneksi ke backend FastAPI dan SQLite.
 */
export async function checkBackendHealth(timeoutMs: number = 6000): Promise<HealthResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(HEALTH_ENDPOINT, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    const data: HealthResponse = await response.json();
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Permintaan kehabisan waktu setelah ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * Mengunggah gambar ke endpoint backend POST /api/vision/detect-ingredients
 * menggunakan XMLHttpRequest (XHR) native.
 */
export async function detectIngredientsFromImage(
  imageUri: string,
  mimeType: string = 'image/jpeg',
  fileName: string = 'food_image.jpg',
  timeoutMs: number = 90000
): Promise<Ingredient[]> {
  return new Promise(async (resolve, reject) => {
    try {
      let res: Response;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        if (imageUri.startsWith('data:')) {
          const bodyPayload = JSON.stringify({
            image_base64: imageUri,
            mime_type: mimeType || 'image/jpeg',
          });
          res = await fetch(DETECT_INGREDIENTS_BASE64_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: bodyPayload,
            signal: controller.signal,
          });
        } else {
          const formData = new FormData();
          formData.append('file', {
            uri: imageUri,
            name: fileName,
            type: mimeType || 'image/jpeg',
          } as any);

          res = await fetch(DETECT_INGREDIENTS_ENDPOINT, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
            },
            body: formData,
            signal: controller.signal,
          });
        }
      } catch (networkErr: any) {
        clearTimeout(timeoutId);
        console.error('[API] detectIngredients networkErr:', networkErr);
        if (networkErr.name === 'AbortError') {
          throw new Error(`Waktu analisis habis (${timeoutMs / 1000} detik). Model AI sedang sibuk atau koneksi lambat, silakan coba lagi.`);
        }
        throw new Error(
          `Koneksi gagal ke server: ${networkErr?.message || networkErr}. Pastikan backend aktif.`
        );
      }
      clearTimeout(timeoutId);

      let responseJson: any = null;
      try {
        responseJson = await res.json();
      } catch {
        // Respons bukan JSON
      }

      if (res.ok) {
        if (responseJson && Array.isArray(responseJson.ingredients)) {
          const list: DetectedIngredientItem[] = responseJson.ingredients;
          const mapped: Ingredient[] = list.map((item, index) => ({
            id: `${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
            name: item.name,
            confidence: item.confidence,
          }));
          resolve(mapped);
        } else {
          reject(
            new Error('Format data dari server tidak valid (daftar ingredients tidak ditemukan).')
          );
        }
      } else {
        let errorMsg = `HTTP ${res.status}`;
        if (responseJson && responseJson.detail) {
          errorMsg =
            typeof responseJson.detail === 'string'
              ? responseJson.detail
              : JSON.stringify(responseJson.detail);
        }
        reject(new Error(`Gagal mendeteksi bahan: ${errorMsg}`));
      }
    } catch (err: any) {
      reject(new Error(err?.message || 'Terjadi kesalahan saat menyiapkan unggahan foto.'));
    }
  });
}

/**
 * Mengirimkan daftar bahan terkonfirmasi ke backend untuk mendapatkan
 * rekomendasi hidangan masakan yang realistis.
 */
export async function getRecipeRecommendations(
  ingredients: string[],
  mode: string = 'rescue',
  constraint?: string,
  cookingStyle?: string,
  timeoutMs: number = 55000
): Promise<RecipeRecommendation[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(RECOMMENDATIONS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        ingredients,
        mode,
        constraint: constraint || undefined,
        cooking_style: cookingStyle || undefined,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMsg = `HTTP ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson.detail) {
          errorMsg =
            typeof errJson.detail === 'string'
              ? errJson.detail
              : JSON.stringify(errJson.detail);
        }
      } catch {
        const text = await response.text();
        if (text) errorMsg += `: ${text}`;
      }
      throw new Error(`Gagal memuat rekomendasi: ${errorMsg}`);
    }

    const data: RecommendationResponse = await response.json();
    const list = data.recommendations || [];

    return list.map((item, index) => ({
      ...item,
      id: item.id || `${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
    }));
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Waktu peracikan resep habis. Silakan coba beberapa saat lagi.');
    }
    throw error;
  }
}
