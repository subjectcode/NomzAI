import { Platform } from 'react-native';
import {
  HEALTH_ENDPOINT,
  DETECT_INGREDIENTS_ENDPOINT,
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
  timeoutMs: number = 45000
): Promise<Ingredient[]> {
  return new Promise(async (resolve, reject) => {
    try {
      const formData = new FormData();

      if (Platform.OS === 'web') {
        // Lingkungan Web: konversi URI/blob/dataURL menjadi objek Blob standar
        const blobResponse = await fetch(imageUri);
        const blob = await blobResponse.blob();
        formData.append('file', blob, fileName);
      } else {
        // Lingkungan Native (Android / iOS):
        if (imageUri.startsWith('data:')) {
          try {
            const blobResponse = await fetch(imageUri);
            const blob = await blobResponse.blob();
            formData.append('file', blob, fileName);
          } catch {
            formData.append('file', {
              uri: imageUri,
              name: fileName,
              type: mimeType || 'image/jpeg',
            } as any);
          }
        } else {
          // File langsung dari galeri Expo ImagePicker
          formData.append('file', {
            uri: imageUri,
            name: fileName,
            type: mimeType || 'image/jpeg',
          } as any);
        }
      }

      const xhr = new XMLHttpRequest();
      xhr.open('POST', DETECT_INGREDIENTS_ENDPOINT);
      xhr.timeout = timeoutMs;
      xhr.setRequestHeader('Accept', 'application/json');

      xhr.onload = () => {
        let responseJson: any = null;
        try {
          responseJson = JSON.parse(xhr.responseText);
        } catch {
          // Respons bukan JSON
        }

        if (xhr.status >= 200 && xhr.status < 300) {
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
          let errorMsg = `HTTP ${xhr.status}`;
          if (responseJson && responseJson.detail) {
            errorMsg =
              typeof responseJson.detail === 'string'
                ? responseJson.detail
                : JSON.stringify(responseJson.detail);
          } else if (xhr.responseText) {
            errorMsg += `: ${xhr.responseText}`;
          }
          reject(new Error(`Gagal mendeteksi bahan: ${errorMsg}`));
        }
      };

      xhr.onerror = () => {
        reject(
          new Error(
            `Koneksi gagal ke server (${DETECT_INGREDIENTS_ENDPOINT}). Pastikan backend aktif dan HP berada di jaringan WiFi yang sama.`
          )
        );
      };

      xhr.ontimeout = () => {
        reject(
          new Error(
            `Waktu analisis habis (${timeoutMs / 1000} detik). Model AI sedang sibuk atau koneksi lambat, silakan coba lagi.`
          )
        );
      };

      xhr.send(formData);
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
  timeoutMs: number = 45000
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
      body: JSON.stringify({ ingredients }),
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
      id: `${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
    }));
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Waktu peracikan resep habis. Silakan coba beberapa saat lagi.');
    }
    throw error;
  }
}
