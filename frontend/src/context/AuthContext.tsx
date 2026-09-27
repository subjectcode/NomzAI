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
} from '../services/authApi';
import {
  saveAuthToken,
  getAuthToken,
  deleteAuthToken,
} from '../services/authStorage';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  register: (input: RegisterInput) => Promise<User>;
  login: (input: LoginInput) => Promise<User>;
  logout: () => Promise<void>;
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
   * Alur:
   * 1. Baca token dari SecureStore
   * 2. Jika tidak ada -> status unauthenticated
   * 3. Jika ada -> panggil GET /api/auth/me
   * 4. Jika valid -> restore user & session
   * 5. Jika invalid/expired (401) -> hapus token dari SecureStore -> unauthenticated
   * 6. Jika terjadi error jaringan -> jangan crash, tandai selesai loading
   */
  const restoreSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const persistedToken = await getAuthToken();
      if (!persistedToken) {
        setUser(null);
        setToken(null);
        return;
      }

      try {
        const userData = await getCurrentUser(persistedToken);
        setToken(persistedToken);
        setUser(userData);
      } catch (err: any) {
        // Jika token tidak valid atau expired (HTTP 401), bersihkan token yang rusak
        if (err.status === 401 || err.message?.includes('401') || err.message?.includes('Token')) {
          await deleteAuthToken();
          setToken(null);
          setUser(null);
        } else {
          // Kesalahan koneksi jaringan sementara: jangan crash aplikasi
          console.warn('Gagal memvalidasi token sesi (kemungkinan masalah jaringan).');
        }
      }
    } catch {
      // SecureStore read error fallback
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
   * Mendaftarkan pengguna baru, menyimpan token ke SecureStore, dan mengaktifkan status auth.
   */
  const handleRegister = async (input: RegisterInput): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await registerUser(input);
      await saveAuthToken(response.access_token);
      setToken(response.access_token);
      setUser(response.user);
      return response.user;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login pengguna, menyimpan token ke SecureStore, dan mengaktifkan status auth.
   */
  const handleLogin = async (input: LoginInput): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await loginUser(input);
      await saveAuthToken(response.access_token);
      setToken(response.access_token);
      setUser(response.user);
      return response.user;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout pengguna: menghapus token dari SecureStore dan mereset user state.
   */
  const handleLogout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await deleteAuthToken();
      setToken(null);
      setUser(null);
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
    login: handleLogin,
    logout: handleLogout,
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
