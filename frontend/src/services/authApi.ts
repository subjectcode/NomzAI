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
        username: input.username ? input.username.trim().toLowerCase() : undefined,
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
      const error: any = new Error(errorMessage);
      error.status = response.status;
      throw error;
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

/**
 * Memperbarui profil pengguna saat ini (PATCH /api/auth/me).
 */
export async function updateUserProfile(
  token: string,
  data: { displayName?: string; username?: string; avatarUrl?: string }
): Promise<User> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(AUTH_ME_ENDPOINT, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        display_name: data.displayName ? data.displayName.trim() : undefined,
        username: data.username ? data.username.trim().toLowerCase() : undefined,
        avatar_url: data.avatarUrl !== undefined ? data.avatarUrl.trim() : undefined,
      }),
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
      throw new Error('Koneksi pembaruan profil kehabisan waktu.');
    }
    throw error;
  }
}

/**
 * Menghapus akun pengguna saat ini (DELETE /api/auth/me).
 */
export async function deleteUserAccount(token: string): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(AUTH_ME_ENDPOINT, {
      method: 'DELETE',
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
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Koneksi penghapusan akun kehabisan waktu.');
    }
    throw error;
  }
}

/**
 * Meminta pengiriman kode OTP ke email.
 */
export async function sendOtp(email: string): Promise<{ success: boolean; message: string }> {
  const baseAuthUrl = AUTH_REGISTER_ENDPOINT.replace('/register', '');
  const response = await fetch(`${baseAuthUrl}/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
  if (!response.ok) {
    const msg = await parseErrorResponse(response);
    throw new Error(msg);
  }
  return await response.json();
}

/**
 * Memverifikasi kode OTP email.
 */
export async function verifyOtp(email: string, otp: string): Promise<{ verified: boolean; message: string }> {
  const baseAuthUrl = AUTH_REGISTER_ENDPOINT.replace('/register', '');
  const response = await fetch(`${baseAuthUrl}/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim() }),
  });
  if (!response.ok) {
    const msg = await parseErrorResponse(response);
    throw new Error(msg);
  }
  return await response.json();
}
