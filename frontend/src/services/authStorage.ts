import * as SecureStore from 'expo-secure-store';

/**
 * Kunci penyimpanan token akses JWT di SecureStore.
 * SecureStore menggunakan Android Keystore dan iOS Keychain terenkripsi.
 */
const TOKEN_KEY = 'nomz_access_token';

/**
 * Menyimpan token akses JWT secara aman ke SecureStore.
 * Tidak pernah mencatat isi token ke console atau log.
 */
export async function saveAuthToken(token: string): Promise<void> {
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    if (isAvailable) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  } catch (error) {
    console.warn('Gagal menyimpan auth token ke SecureStore');
    throw error;
  }
}

/**
 * Mengambil token akses JWT dari SecureStore.
 * Mengembalikan null jika token belum disimpan atau SecureStore tidak tersedia.
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    if (!isAvailable) {
      return null;
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.warn('Gagal mengambil auth token dari SecureStore');
    return null;
  }
}

/**
 * Menghapus token akses JWT dari SecureStore (saat logout atau token tidak valid).
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
}
