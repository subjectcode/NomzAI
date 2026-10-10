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
 * Menginferensi takaran dan unit cerdas secara otomatis untuk bahan makanan.
 */
export function inferSmartIngredientQuantity(name: string): { quantity: number; unit: string } {
  const lower = name.toLowerCase().trim();
  if (lower.includes('telur')) return { quantity: 2, unit: 'butir' };
  if (lower.includes('tomat')) return { quantity: 1, unit: 'buah' };
  if (lower.includes('bawang putih')) return { quantity: 3, unit: 'siung' };
  if (lower.includes('bawang merah')) return { quantity: 3, unit: 'butir' };
  if (lower.includes('bawang bombay')) return { quantity: 1, unit: 'buah' };
  if (lower.includes('wortel')) return { quantity: 1, unit: 'buah' };
  if (lower.includes('kentang')) return { quantity: 2, unit: 'buah' };
  if (lower.includes('mentimun') || lower.includes('timun')) return { quantity: 1, unit: 'buah' };
  if (lower.includes('cabai') || lower.includes('cabe')) return { quantity: 5, unit: 'buah' };
  if (lower.includes('bayam') || lower.includes('kangkung') || lower.includes('sawi')) return { quantity: 1, unit: 'ikat' };
  if (lower.includes('tahu') || lower.includes('tempe')) return { quantity: 1, unit: 'potong' };
  if (lower.includes('ayam') || lower.includes('daging') || lower.includes('ikan') || lower.includes('udang')) return { quantity: 250, unit: 'g' };
  if (lower.includes('susu') || lower.includes('minyak') || lower.includes('santan')) return { quantity: 200, unit: 'ml' };
  if (lower.includes('beras') || lower.includes('nasi') || lower.includes('tepung')) return { quantity: 1, unit: 'porsi' };
  return { quantity: 1, unit: 'buah' };
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
          const mapped: Ingredient[] = list.map((item, index) => {
            const fallback = inferSmartIngredientQuantity(item.name);
            const qty =
              item.quantity !== undefined && item.quantity !== null && item.quantity !== ''
                ? typeof item.quantity === 'number'
                  ? item.quantity
                  : parseFloat(String(item.quantity)) || fallback.quantity
                : fallback.quantity;
            const unit = item.unit ? String(item.unit).trim() : fallback.unit;

            return {
              id: `${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
              name: item.name,
              confidence: item.confidence,
              quantity: qty,
              unit: unit,
            };
          });
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
 * Normalisasi daftar bahan makanan agar pencarian dan caching konsisten.
 */
export function normalizeIngredients(ingredients: string[]): string[] {
  return Array.from(
    new Set(
      ingredients
        .map((i) => i.trim().toLowerCase())
        .filter((i) => i.length > 0)
    )
  ).sort();
}

/**
 * Membentuk cache key unik berdasarkan bahan terkonfirmasi dan filter masakan.
 */
export function buildRecommendationCacheKey(
  ingredients: string[],
  mode: string = 'rescue',
  constraint?: string,
  cookingStyle?: string
): string {
  const norm = normalizeIngredients(ingredients);
  return `${norm.join('::')}||${mode.trim()}||${(constraint || '').trim()}||${(cookingStyle || '').trim()}`;
}

// In-memory cache & deduplication pool
interface CacheEntry {
  timestamp: number;
  data: RecipeRecommendation[];
}

const recommendationCache = new Map<string, CacheEntry>();
const inFlightRecommendations = new Map<string, Promise<RecipeRecommendation[]>>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 menit

/**
 * Membersihkan cache rekomendasi lokal (misal saat logout atau reset akun).
 */
export function clearRecommendationCache(): void {
  recommendationCache.clear();
  inFlightRecommendations.clear();
}

/**
 * Mengirimkan daftar bahan terkonfirmasi ke backend untuk mendapatkan
 * rekomendasi hidangan masakan yang realistis.
 *
 * Dilengkapi dengan:
 * - Deduplikasi panggilan identik simultan (in-flight request deduplication)
 * - Session-scoped cache berbasis normalisasi bahan & filter masakan
 * - Bounded retry untuk transient failure (HTTP 502/503/504) dengan backoff
 * - Timing metrics tanpa membocorkan kredensial
 */
export async function getRecipeRecommendations(
  ingredients: string[],
  mode: string = 'rescue',
  constraint?: string,
  cookingStyle?: string,
  timeoutMs: number = 30000,
  forceRefresh: boolean = false
): Promise<RecipeRecommendation[]> {
  const normalized = normalizeIngredients(ingredients);
  if (normalized.length === 0) {
    throw new Error('Daftar bahan makanan tidak boleh kosong.');
  }

  const cacheKey = buildRecommendationCacheKey(normalized, mode, constraint, cookingStyle);

  // 1. Cek cache lokal jika bukan forceRefresh
  if (!forceRefresh) {
    const cached = recommendationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  // 2. Cek in-flight request deduplication jika permintaan identik sedang berjalan
  if (inFlightRecommendations.has(cacheKey)) {
    return inFlightRecommendations.get(cacheKey)!;
  }

  // 3. Bangun execution promise dengan bounded retry
  const fetchPromise = (async () => {
    const maxRetries = 1;
    let attempt = 0;
    const startTime = Date.now();

    while (attempt <= maxRetries) {
      attempt++;
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
            ingredients: normalized,
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

          // Bounded retry untuk temporary 502/503/504
          const isRetryable = response.status >= 500 && response.status <= 504;
          if (isRetryable && attempt <= maxRetries) {
            const jitter = Math.random() * 500;
            await new Promise((res) => setTimeout(res, 1000 + jitter));
            continue;
          }

          throw new Error(`Gagal memuat rekomendasi: ${errorMsg}`);
        }

        const data: RecommendationResponse = await response.json();
        const list = data.recommendations || [];

        const mapped: RecipeRecommendation[] = list.map((item, index) => ({
          ...item,
          id: item.id || `rec-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
        }));

        // Simpan ke cache
        recommendationCache.set(cacheKey, {
          timestamp: Date.now(),
          data: mapped,
        });

        const elapsed = Date.now() - startTime;
        if (__DEV__) {
          console.log(`[Nomz Recommendation] Selesai dalam ${elapsed}ms (${mapped.length} resep)`);
        }

        return mapped;
      } catch (error: any) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
          if (attempt <= maxRetries) {
            continue;
          }
          throw new Error('Waktu pencarian resep habis. Silakan periksa koneksi dan coba lagi.');
        }

        if (attempt <= maxRetries && !error.message?.includes('HTTP 400')) {
          const jitter = Math.random() * 400;
          await new Promise((res) => setTimeout(res, 800 + jitter));
          continue;
        }

        throw error;
      }
    }

    throw new Error('Gagal mendapatkan rekomendasi masakan setelah percobaan ulang.');
  })();

  // Simpan promise aktif ke map deduplikasi
  inFlightRecommendations.set(cacheKey, fetchPromise);

  try {
    return await fetchPromise;
  } finally {
    inFlightRecommendations.delete(cacheKey);
  }
}
