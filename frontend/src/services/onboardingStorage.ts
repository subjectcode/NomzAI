import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Kunci penyimpanan status penyelesaian onboarding.
 * Menggunakan AsyncStorage karena ini preferensi non-sensitif (bukan kredensial/JWT).
 */
const ONBOARDING_COMPLETED_KEY = '@nomz:onboarding_completed';

/**
 * Memeriksa apakah pengguna sudah menyelesaikan slide onboarding.
 */
export async function getOnboardingCompleted(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    return value === 'true';
  } catch (error) {
    console.warn('Gagal membaca status onboarding dari penyimpanan lokal');
    return false;
  }
}

/**
 * Menyimpan status bahwa pengguna telah menyelesaikan slide onboarding.
 */
export async function setOnboardingCompleted(completed: boolean = true): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, completed ? 'true' : 'false');
  } catch (error) {
    console.warn('Gagal menyimpan status onboarding ke penyimpanan lokal');
  }
}

/**
 * Mereset status onboarding (berguna untuk pengujian atau debug).
 */
export async function resetOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
  } catch (error) {
    console.warn('Gagal mereset status onboarding');
  }
}
