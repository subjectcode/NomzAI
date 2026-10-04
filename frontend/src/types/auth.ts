/**
 * Tipe data autentikasi Nomz (selaras dengan Pydantic schemas backend M5.2B).
 */

export interface User {
  id: string;
  email: string;
  username?: string | null;
  display_name: string;
  avatar_url: string | null;
  auth_provider: 'email' | 'google' | string;
  is_verified?: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  displayName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface GoogleAuthInput {
  idToken: string;
}
