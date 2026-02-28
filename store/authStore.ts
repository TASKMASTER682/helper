'use client';
import { create } from 'zustand';
import { authAPI } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  profile: any;
  stats: any;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
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

  init: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('upsc_token');
      const userStr = localStorage.getItem('upsc_user');
      if (token && userStr) {
        set({ token, user: JSON.parse(userStr) });
      }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      console.log('Auth store: Sending login request to API');
      const { data } = await authAPI.login({ email, password });
      console.log('Auth store: Login response:', data);
      localStorage.setItem('upsc_token', data.token);
      localStorage.setItem('upsc_user', JSON.stringify(data.user));
      set({ token: data.token, user: data.user, isLoading: false });
    } catch (err: any) {
      console.error('Auth store: Login error:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        fullError: err
      });
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (name, email, password, state) => {
    set({ isLoading: true });
    try {
      console.log('Auth store: Sending register request to API');
      const { data } = await authAPI.register({ name, email, password, state });
      console.log('Auth store: Register response:', data);
      if (data?.token && data?.user) {
        localStorage.setItem('upsc_token', data.token);
        localStorage.setItem('upsc_user', JSON.stringify(data.user));
        set({ token: data.token, user: data.user, isLoading: false });
      } else {
        set({ isLoading: false });
      }
      return data;
    } catch (err) {
      console.error('Auth store: Register error:', err);
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('upsc_token');
    localStorage.removeItem('upsc_user');
    set({ user: null, token: null });
  },

  setUser: (user) => {
    localStorage.setItem('upsc_user', JSON.stringify(user));
    set({ user });
  }
}));
