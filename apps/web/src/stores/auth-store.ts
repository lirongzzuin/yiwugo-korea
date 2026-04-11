/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  memberType: 'INDIVIDUAL' | 'BUSINESS';
  points: number;
  avatar?: string;
  isEmailVerified?: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  memberType?: 'INDIVIDUAL' | 'BUSINESS';
  businessNumber?: string;
  businessName?: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeMarketing?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, accessToken?: string) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  setToken: (token: string) => void;
  apiLogin: (email: string, password: string, keepLoggedIn?: boolean) => Promise<void>;
  apiRegister: (data: RegisterData) => Promise<void>;
  apiSocialLogin: (provider: string, code: string) => Promise<{ isNewUser: boolean }>;
  apiLogout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

function getToken(): string | null {
  try {
    const raw = localStorage.getItem('yiwugo-auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.state?.accessToken || null;
    }
  } catch { /* ignore */ }
  return null;
}

async function apiRequest(path: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `요청 실패 (${res.status})`);
  return data;
}

export const useAuthStore = create<AuthState>()(
  (persist as any)(
    (set: any) => ({
      user: null as User | null,
      accessToken: null as string | null,
      isAuthenticated: false,

      login: (user: User, accessToken?: string) => set((s: AuthState) => ({
        user,
        accessToken: accessToken || s.accessToken,
        isAuthenticated: true,
      })),

      logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),

      updateUser: (data: Partial<User>) => set((s: AuthState) => ({
        user: s.user ? { ...s.user, ...data } : null,
      })),

      setToken: (token: string) => set({ accessToken: token }),

      apiLogin: async (email: string, password: string, keepLoggedIn?: boolean) => {
        const data = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password, keepLoggedIn }),
        });
        set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true });
      },

      apiRegister: async (registerData: RegisterData) => {
        const data = await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify(registerData),
        });
        set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true });
      },

      apiSocialLogin: async (provider: string, code: string) => {
        const data = await apiRequest('/auth/social', {
          method: 'POST',
          body: JSON.stringify({ provider, code }),
        });
        set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true });
        return { isNewUser: data.isNewUser || false };
      },

      apiLogout: async () => {
        try { await apiRequest('/auth/logout', { method: 'POST' }); } catch { /* ok */ }
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          const data = await apiRequest('/auth/me');
          if (data) set({ user: data, isAuthenticated: true });
        } catch { /* token expired */ }
      },
    }),
    {
      name: 'yiwugo-auth',
      partialize: (state: AuthState) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
