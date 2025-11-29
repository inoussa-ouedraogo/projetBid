import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  login as loginRequest,
  me,
  register as registerRequest,
  deleteAccount as deleteAccountRequest,
  updateProfile as updateProfileRequest,
} from '@/api/auth';
import { setAuthToken } from '@/api/client';
import { LoginResponse, MeResponse, RegisterResponse } from '@/api/types';
import { deleteToken, readToken, saveToken } from '@/lib/secure-storage';

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  password: string;
  consentRgpd: boolean;
};

type AuthContextValue = {
  user?: MeResponse | null;
  token?: string | null;
  initializing: boolean;
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  register: (payload: RegisterPayload) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateProfile: (payload: { name?: string; phone?: string; password?: string; city?: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await readToken();
        if (stored) {
          setAuthToken(stored);
          setToken(stored);
          const profile = await me();
          setUser(profile);
        }
      } catch (error) {
        console.warn('[auth] Unable to restore session', error);
        await deleteToken();
        setAuthToken(null);
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    const profile = await me();
    setUser(profile);
  }, [token]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await loginRequest(payload);
      await saveToken(response.token);
      setAuthToken(response.token);
      setToken(response.token);
      const profile = await me();
      setUser(profile);
      return response;
    },
    []
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const response = await registerRequest(payload);
      return response;
    },
    []
  );

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    await deleteToken();
  }, []);

  const deleteAccount = useCallback(async () => {
    await deleteAccountRequest();
    setUser(null);
    setToken(null);
    setAuthToken(null);
    await deleteToken();
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      initializing,
      login,
      register,
      logout,
      refreshProfile,
      deleteAccount,
      updateProfile: async (payload: {
        name?: string;
        phone?: string;
        password?: string;
        city?: string;
      }) => {
        const updated = await updateProfileRequest(payload);
        setUser(updated);
      },
    }),
    [user, token, initializing, login, register, logout, refreshProfile, deleteAccount]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
};
