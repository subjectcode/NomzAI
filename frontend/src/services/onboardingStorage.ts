import AsyncStorage from '@react-native-async-storage/async-storage';
import { getActiveUserId } from './authStorage';

const ONBOARDING_BASE_KEY = '@nomz_onboarding_completed';

async function getOnboardingKey(userId?: string): Promise<string> {
  const uid = userId || (await getActiveUserId());
  return uid ? `${ONBOARDING_BASE_KEY}_${uid}` : `${ONBOARDING_BASE_KEY}_device`;
}

/**
 * Memeriksa apakah pengguna sudah menyelesaikan slide onboarding.
 * Dianggap selesai jika sudah diselesaikan di level perangkat atau level user ini.
 */
export async function getOnboardingCompleted(userId?: string): Promise<boolean> {
  try {
    // 1. Cek status di tingkat perangkat
    const deviceValue = await AsyncStorage.getItem(`${ONBOARDING_BASE_KEY}_device`);
    if (deviceValue === 'true') {
      return true;
    }

    // 2. Jika ada userId aktif, cek juga status spesifik akun
    const uid = userId || (await getActiveUserId());
    if (uid) {
      const userValue = await AsyncStorage.getItem(`${ONBOARDING_BASE_KEY}_${uid}`);
      if (userValue === 'true') {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.warn('Gagal membaca status onboarding dari penyimpanan lokal');
    return false;
  }
}

/**
 * Menyimpan status bahwa pengguna telah menyelesaikan slide onboarding.
 * Menyimpan ke level perangkat dan level user agar tidak berulang.
 */
export async function setOnboardingCompleted(
  completed: boolean = true,
  userId?: string
): Promise<void> {
  try {
    const val = completed ? 'true' : 'false';
    await AsyncStorage.setItem(`${ONBOARDING_BASE_KEY}_device`, val);
    const uid = userId || (await getActiveUserId());
    if (uid) {
      await AsyncStorage.setItem(`${ONBOARDING_BASE_KEY}_${uid}`, val);
    }
  } catch (error) {
    console.warn('Gagal menyimpan status onboarding ke penyimpanan lokal');
  }
}

/**
 * Mereset status onboarding (berguna untuk pengujian atau debug).
 */
export async function resetOnboarding(userId?: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`${ONBOARDING_BASE_KEY}_device`);
    const uid = userId || (await getActiveUserId());
    if (uid) {
      await AsyncStorage.removeItem(`${ONBOARDING_BASE_KEY}_${uid}`);
    }
  } catch (error) {
    console.warn('Gagal mereset status onboarding');
  }
}
