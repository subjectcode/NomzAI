import {
  AUTH_REGISTER_ENDPOINT,
  AUTH_LOGIN_ENDPOINT,
  AUTH_ME_ENDPOINT,
  AUTH_GOOGLE_ENDPOINT,
} from '../config';
import {
  AuthResponse,
  GoogleAuthInput,
  LoginInput,
  RegisterInput,
  User,
} from '../types';

const REQUEST_TIMEOUT_MS = 10000;

/**
 * Parsing terpusat untuk error dari response backend FastAPI.
 */
async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data.detail === 'string') {
      return data.detail;
    }
    if (Array.isArray(data.detail) && data.detail.length > 0) {
      return data.detail
        .map((d: any) => d.msg || JSON.stringify(d))
        .join(', ');
    }
  } catch {
    // Respons bukan JSON valid
  }
  return `Permintaan gagal (status ${response.status})`;
}

/**
 * Mendaftarkan akun pengguna baru dengan email dan password.
 */
export async function registerUser(input: RegisterInput): Promise<AuthResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(AUTH_REGISTER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: input.email.trim(),
        display_name: input.displayName.trim(),
        password: input.password,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response);
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Koneksi pendaftaran kehabisan waktu.');
    }
    throw error;
  }
}

/**
 * Login dengan email dan password yang sudah terdaftar.
 */
export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(AUTH_LOGIN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: input.email.trim(),
        password: input.password,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response);
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Koneksi login kehabisan waktu.');
    }
    throw error;
  }
}

/**
 * Mengambil profil pengguna terautentikasi (GET /api/auth/me) menggunakan JWT token.
 */
export async function getCurrentUser(token: string): Promise<User> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(AUTH_ME_ENDPOINT, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response);
      const error: any = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Koneksi verifikasi profil kehabisan waktu.');
    }
    throw error;
  }
}

/**
 * Interface autentikasi Google Sign-In backend (diimplementasikan di level contract,
 * akuisisi token dari Expo AuthSession disiapkan untuk milestone berikutnya).
 */
export async function googleAuth(input: GoogleAuthInput): Promise<AuthResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(AUTH_GOOGLE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        id_token: input.idToken,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response);
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Koneksi autentikasi Google kehabisan waktu.');
    }
    throw error;
  }
}
