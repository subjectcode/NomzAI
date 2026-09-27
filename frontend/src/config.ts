import { Platform } from 'react-native';

/**
 * Resolves the default backend base URL based on runtime platform:
 * - Android Emulator uses 10.0.2.2 to reach host machine loopback
 * - Web and iOS Simulator can reach host machine at localhost
 */
const getDefaultBaseUrl = (): string => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }
  return 'http://localhost:8000';
};

/**
 * Backend base URL read from Expo environment variable: EXPO_PUBLIC_API_URL
 * Defaults to localhost / emulator address if not explicitly set.
 */
export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL || getDefaultBaseUrl();

export const HEALTH_ENDPOINT = `${API_BASE_URL}/api/health`;
export const DETECT_INGREDIENTS_ENDPOINT = `${API_BASE_URL}/api/vision/detect-ingredients`;
export const RECOMMENDATIONS_ENDPOINT = `${API_BASE_URL}/api/recommendations`;
export const AUTH_REGISTER_ENDPOINT = `${API_BASE_URL}/api/auth/register`;
export const AUTH_LOGIN_ENDPOINT = `${API_BASE_URL}/api/auth/login`;
export const AUTH_ME_ENDPOINT = `${API_BASE_URL}/api/auth/me`;
export const AUTH_GOOGLE_ENDPOINT = `${API_BASE_URL}/api/auth/google`;
