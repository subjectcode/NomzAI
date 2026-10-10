import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  User,
  RegisterInput,
  LoginInput,
} from '../types';
import {
  loginUser,
  registerUser,
  getCurrentUser,
  googleAuth,
  updateUserProfile,
  deleteUserAccount,
  setPassword as setPasswordApi,
} from '../services/authApi';
import {
  saveAuthToken,
  getAuthToken,
  deleteAuthToken,
  saveActiveUserId,
  clearActiveUserId,
  cleanupLegacyGlobalStorage,
} from '../services/authStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearRecommendationCache } from '../services/api';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  register: (input: RegisterInput) => Promise<{ access_token: string; user: User }>;
  establishSession: (accessToken: string, userData: User) => Promise<void>;
  login: (input: LoginInput, rememberMe?: boolean) => Promise<User>;
  loginWithGoogle: (idToken: string) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (data: { displayName?: string; username?: string; avatarUrl?: string }) => Promise<User>;
  deleteAccount: () => Promise<void>;
  setPassword: (password: string) => Promise<User>;
  restoreSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isAuthenticated = !!user && !!token;

  /**
   * Mengembalikan sesi pengguna saat aplikasi dibuka.
   */
  const restoreSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const persistedToken = await getAuthToken();
      if (!persistedToken) {
        await clearActiveUserId();
        setUser(null);
        setToken(null);
        return;
      }

      try {
        const userData = await getCurrentUser(persistedToken);
        await saveActiveUserId(userData.id);
        await cleanupLegacyGlobalStorage();
        setToken(persistedToken);
        setUser(userData);
      } catch (err: any) {
        if (err.status === 401 || err.message?.includes('401') || err.message?.includes('Token')) {
          await deleteAuthToken();
          await clearActiveUserId();
          setToken(null);
          setUser(null);
        } else {
          console.warn('Gagal memvalidasi token sesi (kemungkinan masalah jaringan).');
        }
      }
    } catch {
      await clearActiveUserId();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    restoreSession().catch(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [restoreSession]);

  /**
   * Mengaktifkan sesi pengguna secara persisten (setelah login / verifikasi OTP).
   */
  const establishSession = async (accessToken: string, userData: User): Promise<void> => {
    setIsLoading(true);
    try {
      await saveAuthToken(accessToken);
      await saveActiveUserId(userData.id);
      await cleanupLegacyGlobalStorage();
      setToken(accessToken);
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Mendaftarkan pengguna baru (mengembalikan kredensial untuk dilanjutkan dengan verifikasi OTP).
   */
  const handleRegister = async (input: RegisterInput): Promise<{ access_token: string; user: User }> => {
    setIsLoading(true);
    try {
      const response = await registerUser(input);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login pengguna dan mengikat active user ID.
   */
  const handleLogin = async (input: LoginInput, rememberMe: boolean = true): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await loginUser(input);
      if (rememberMe) {
        await saveAuthToken(response.access_token);
      } else {
        await deleteAuthToken();
      }
      await saveActiveUserId(response.user.id);
      await cleanupLegacyGlobalStorage();
      setToken(response.access_token);
      setUser(response.user);
      return response.user;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login pengguna via Google Sign-In.
   */
  const handleGoogleLogin = async (idToken: string): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await googleAuth({ idToken });
      await saveAuthToken(response.access_token);
      await saveActiveUserId(response.user.id);
      await cleanupLegacyGlobalStorage();
      setToken(response.access_token);
      setUser(response.user);
      return response.user;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout pengguna: menghapus token dan active user ID, mereset state.
   */
  const handleLogout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      clearRecommendationCache();
      await deleteAuthToken();
      await clearActiveUserId();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Memperbarui profil pengguna (display name, username, avatar).
   */
  const handleUpdateProfile = async (data: {
    displayName?: string;
    username?: string;
    avatarUrl?: string;
  }): Promise<User> => {
    if (!token) throw new Error('Pengguna belum terautentikasi.');
    setIsLoading(true);
    try {
      const updated = await updateUserProfile(token, data);
      setUser(updated);
      return updated;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Menghapus akun pengguna dari server dan menghapus seluruh data lokal user ini.
   */
  const handleDeleteAccount = async (): Promise<void> => {
    if (!token) throw new Error('Pengguna belum terautentikasi.');
    const currentUserId = user?.id;
    setIsLoading(true);
    try {
      clearRecommendationCache();
      await deleteUserAccount(token);
      if (currentUserId) {
        await AsyncStorage.multiRemove([
          `@nomz_cooking_history_${currentUserId}`,
          `@nomz_pantry_items_${currentUserId}`,
          `@nomz_saved_recipes_${currentUserId}`,
          `@nomz_meal_planner_${currentUserId}`,
          `@nomz_onboarding_completed_${currentUserId}`,
          `@nomz_avatar_${currentUserId}`,
        ]);
      }
      await deleteAuthToken();
      await clearActiveUserId();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Mengatur atau memperbarui password akun yang sedang login.
   */
  const handleSetPassword = async (newPassword: string): Promise<User> => {
    if (!token) throw new Error('Pengguna belum terautentikasi.');
    setIsLoading(true);
    try {
      const updatedUser = await setPasswordApi(token, newPassword);
      setUser(updatedUser);
      return updatedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    register: handleRegister,
    establishSession,
    login: handleLogin,
    loginWithGoogle: handleGoogleLogin,
    logout: handleLogout,
    updateProfile: handleUpdateProfile,
    deleteAccount: handleDeleteAccount,
    setPassword: handleSetPassword,
    restoreSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook untuk mengakses state dan fungsi autentikasi di komponen manapun.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam <AuthProvider>');
  }
  return context;
};
