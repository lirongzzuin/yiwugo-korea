import { useCallback } from 'react';
import type {
  User,
  AuthProvider,
  LoginRequest,
  RegisterRequest,
  SocialLoginRequest,
  TokenPair,
} from '@yiwugo/shared';
import { useAuthStore } from '../stores/auth.store';

const API_BASE_URL =
  typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : '';

async function authFetch<T>(
  path: string,
  init?: RequestInit & { accessToken?: string },
): Promise<T> {
  const { accessToken, ...rest } = init ?? {};
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...rest,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(body || `HTTP ${res.status}`);
  }
  return res.json();
}

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (req: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  register: (req: RegisterRequest) => Promise<void>;
  socialLogin: (provider: AuthProvider, accessToken: string, idToken?: string) => Promise<void>;
  refreshToken: () => Promise<void>;
}

/**
 * Authentication hook backed by the auth Zustand store.
 */
export function useAuth(): UseAuthReturn {
  const { user, isAuthenticated, isLoading, setUser, setTokens, logout: clearAuth, setLoading } =
    useAuthStore();

  const login = useCallback(
    async (req: LoginRequest) => {
      setLoading(true);
      try {
        const data = await authFetch<{ user: User; tokens: TokenPair }>(
          '/api/v1/auth/login',
          { method: 'POST', body: JSON.stringify(req) },
        );
        setUser(data.user);
        setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      } finally {
        setLoading(false);
      }
    },
    [setUser, setTokens, setLoading],
  );

  const register = useCallback(
    async (req: RegisterRequest) => {
      setLoading(true);
      try {
        const data = await authFetch<{ user: User; tokens: TokenPair }>(
          '/api/v1/auth/register',
          { method: 'POST', body: JSON.stringify(req) },
        );
        setUser(data.user);
        setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      } finally {
        setLoading(false);
      }
    },
    [setUser, setTokens, setLoading],
  );

  const socialLogin = useCallback(
    async (provider: AuthProvider, accessToken: string, idToken?: string) => {
      setLoading(true);
      try {
        const req: SocialLoginRequest = { provider, accessToken, idToken };
        const data = await authFetch<{ user: User; tokens: TokenPair }>(
          '/api/v1/auth/social',
          { method: 'POST', body: JSON.stringify(req) },
        );
        setUser(data.user);
        setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      } finally {
        setLoading(false);
      }
    },
    [setUser, setTokens, setLoading],
  );

  const logout = useCallback(async () => {
    try {
      const token = useAuthStore.getState().accessToken;
      if (token) {
        await authFetch('/api/v1/auth/logout', {
          method: 'POST',
          accessToken: token,
        }).catch(() => {
          // Silent fail - clear local state regardless
        });
      }
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const refreshToken = useCallback(async () => {
    const currentRefreshToken = useAuthStore.getState().refreshToken;
    if (!currentRefreshToken) {
      clearAuth();
      return;
    }

    try {
      const data = await authFetch<{ tokens: TokenPair }>(
        '/api/v1/auth/refresh',
        { method: 'POST', body: JSON.stringify({ refreshToken: currentRefreshToken }) },
      );
      setTokens(data.tokens.accessToken, data.tokens.refreshToken);
    } catch {
      clearAuth();
    }
  }, [setTokens, clearAuth]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    socialLogin,
    refreshToken,
  };
}
