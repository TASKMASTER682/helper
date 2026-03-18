'use client';
import { create } from 'zustand';
import { authAPI } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profile: any;
  stats: any;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, state: string) => Promise<{ requiresEmailVerification?: boolean; message?: string }>;
  logout: () => void;
  setUser: (user: User) => void;
  init: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitializing: true,

  init: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('upsc_token');
      const userStr = localStorage.getItem('upsc_user');
      if (token && userStr) {
        set({ token, user: JSON.parse(userStr), isInitializing: false });
      } else {
        set({ isInitializing: false });
      }
    } else {
      set({ isInitializing: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('upsc_token', data.token);
      localStorage.setItem('upsc_user', JSON.stringify(data.user));
      set({ token: data.token, user: data.user, isLoading: false, isInitializing: false });
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (name, email, password, state) => {
    set({ isLoading: true });
    try {
      const { data } = await authAPI.register({ name, email, password, state });
      if (data?.token && data?.user) {
        localStorage.setItem('upsc_token', data.token);
        localStorage.setItem('upsc_user', JSON.stringify(data.user));
        set({ token: data.token, user: data.user, isLoading: false, isInitializing: false });
      } else {
        set({ isLoading: false });
      }
      return data;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('upsc_token');
    localStorage.removeItem('upsc_user');
    set({ user: null, token: null, isInitializing: false });
  },

  setUser: (user) => {
    localStorage.setItem('upsc_user', JSON.stringify(user));
    set({ user });
  }
}));
