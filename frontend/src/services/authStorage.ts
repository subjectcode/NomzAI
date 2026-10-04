import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Kunci penyimpanan token akses JWT di SecureStore.
 * SecureStore menggunakan Android Keystore dan iOS Keychain terenkripsi.
 */
const TOKEN_KEY = 'nomz_access_token';
const ASYNC_FALLBACK_KEY = '@nomz:access_token_fallback';

/**
 * Menyimpan token akses JWT secara aman ke SecureStore (dengan fallback AsyncStorage).
 */
export async function saveAuthToken(token: string): Promise<void> {
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    if (isAvailable) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      await AsyncStorage.setItem(ASYNC_FALLBACK_KEY, token);
    }
  } catch (error) {
    console.warn('Fallback menyimpan auth token ke AsyncStorage');
    try {
      await AsyncStorage.setItem(ASYNC_FALLBACK_KEY, token);
    } catch {
      // ignore
    }
  }
}

/**
 * Mengambil token akses JWT dari SecureStore (dengan fallback AsyncStorage).
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    if (isAvailable) {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) return token;
    }
    return await AsyncStorage.getItem(ASYNC_FALLBACK_KEY);
  } catch (error) {
    try {
      return await AsyncStorage.getItem(ASYNC_FALLBACK_KEY);
    } catch {
      return null;
    }
  }
}

/**
 * Menghapus token akses JWT dari SecureStore dan AsyncStorage (saat logout atau token tidak valid).
 */
export async function deleteAuthToken(): Promise<void> {
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    if (isAvailable) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    console.warn('Gagal menghapus auth token dari SecureStore');
  }
  try {
    await AsyncStorage.removeItem(ASYNC_FALLBACK_KEY);
  } catch {
    // ignore
  }
}

let inMemoryActiveUserId: string | null = null;
const ACTIVE_USER_ID_KEY = '@nomz:active_user_id';

/**
 * Menyimpan ID pengguna yang sedang aktif ke penyimpanan lokal & cache memori.
 */
export async function saveActiveUserId(userId: string): Promise<void> {
  inMemoryActiveUserId = userId;
  try {
    await AsyncStorage.setItem(ACTIVE_USER_ID_KEY, userId);
  } catch (error) {
    console.warn('Gagal menyimpan active user id:', error);
  }
}

/**
 * Mengambil ID pengguna yang sedang aktif (memori cache didahulukan).
 */
export async function getActiveUserId(): Promise<string | null> {
  if (inMemoryActiveUserId) return inMemoryActiveUserId;
  try {
    const stored = await AsyncStorage.getItem(ACTIVE_USER_ID_KEY);
    inMemoryActiveUserId = stored;
    return stored;
  } catch {
    return null;
  }
}

/**
 * Menghapus ID pengguna yang aktif saat logout atau hapus akun.
 */
export async function clearActiveUserId(): Promise<void> {
  inMemoryActiveUserId = null;
  try {
    await AsyncStorage.removeItem(ACTIVE_USER_ID_KEY);
  } catch (error) {
    console.warn('Gagal membersihkan active user id:', error);
  }
}

/**
 * Menghapus kunci global warisan yang tidak terisolasi per user
 * untuk mencegah kebocoran data antar akun pengguna (Section 1 & 14).
 */
export async function cleanupLegacyGlobalStorage(): Promise<void> {
  const legacyKeys = [
    '@nomz_cooking_history',
    '@nomz_pantry_items',
    '@nomz_saved_recipes',
    '@nomz_meal_planner',
  ];
  try {
    await AsyncStorage.multiRemove(legacyKeys);
  } catch {
    // ignore
  }
}
