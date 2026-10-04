import AsyncStorage from '@react-native-async-storage/async-storage';
import { getActiveUserId } from './authStorage';

const ONBOARDING_BASE_KEY = '@nomz_onboarding_completed';

async function getOnboardingKey(userId?: string): Promise<string> {
  const uid = userId || (await getActiveUserId());
  return uid ? `${ONBOARDING_BASE_KEY}_${uid}` : `${ONBOARDING_BASE_KEY}_device`;
}

/**
 * Memeriksa apakah pengguna sudah menyelesaikan slide onboarding.
 */
export async function getOnboardingCompleted(userId?: string): Promise<boolean> {
  try {
    const key = await getOnboardingKey(userId);
    const value = await AsyncStorage.getItem(key);
    return value === 'true';
  } catch (error) {
    console.warn('Gagal membaca status onboarding dari penyimpanan lokal');
    return false;
  }
}

/**
 * Menyimpan status bahwa pengguna telah menyelesaikan slide onboarding.
 */
export async function setOnboardingCompleted(
  completed: boolean = true,
  userId?: string
): Promise<void> {
  try {
    const key = await getOnboardingKey(userId);
    await AsyncStorage.setItem(key, completed ? 'true' : 'false');
  } catch (error) {
    console.warn('Gagal menyimpan status onboarding ke penyimpanan lokal');
  }
}

/**
 * Mereset status onboarding (berguna untuk pengujian atau debug).
 */
export async function resetOnboarding(userId?: string): Promise<void> {
  try {
    const key = await getOnboardingKey(userId);
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn('Gagal mereset status onboarding');
  }
}
