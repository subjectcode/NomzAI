import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '../config';

let isConfigured = false;

/**
 * Menginisialisasi Google Sign-In SDK dengan konfigurasi webClientId.
 * webClientId diperlukan agar Google Play Services menerbitkan ID token (aud)
 * yang dapat diverifikasi oleh backend FastAPI server-side.
 */
export function initializeGoogleAuth(): void {
  if (isConfigured) return;

  if (GOOGLE_WEB_CLIENT_ID) {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      scopes: ['profile', 'email'],
      offlineAccess: false,
    });
    isConfigured = true;
  }
}

/**
 * Menjalankan alur autentikasi Google asli (native One-Tap / Account Chooser).
 * Mengembalikan ID token string jika sukses, atau null jika dibatalkan oleh pengguna.
 */
export async function promptGoogleSignIn(): Promise<string | null> {
  initializeGoogleAuth();

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();

    if (response.type === 'cancelled') {
      return null;
    }

    if (response.type === 'success') {
      const idToken = response.data.idToken;
      if (!idToken) {
        throw new Error('Gagal mendapatkan token identitas Google. Silakan coba lagi.');
      }
      return idToken;
    }

    return null;
  } catch (error: any) {
    if (
      error.code === statusCodes.SIGN_IN_CANCELLED ||
      error.message?.includes('cancelled') ||
      error.message?.includes('12501') // Google Sign In CANCELED code
    ) {
      // User membatalkan dialog secara sengaja — senyap
      return null;
    }

    if (error.code === statusCodes.IN_PROGRESS) {
      // Sedang dalam proses
      return null;
    }

    if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error('Layanan Google Play tidak tersedia atau perlu diperbarui.');
    }

    // Format error ramah pengguna dalam Bahasa Indonesia
    const rawMessage = error.message || '';
    if (rawMessage.includes('NETWORK_ERROR') || rawMessage.includes('7')) {
      throw new Error('Koneksi ke Google bermasalah. Periksa jaringan internet Anda.');
    }

    throw new Error(error.message || 'Gagal masuk dengan Google. Silakan coba lagi.');
  }
}
