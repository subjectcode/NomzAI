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
