import { create } from 'zustand';
import { User } from '../types';
import { apiClient, tokenStorage } from '../lib/api-client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initAuth: async () => {
    const token = tokenStorage.getAccessToken();
    const cachedUser = tokenStorage.getUser();

    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    if (cachedUser) {
      set({ user: cachedUser, isAuthenticated: true, isLoading: false });
    }

    try {
      const res: any = await apiClient.get('/auth/me');
      if (res?.data) {
        tokenStorage.setUser(res.data);
        set({ user: res.data, isAuthenticated: true, isLoading: false });
      }
    } catch {
      tokenStorage.clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    const res: any = await apiClient.post('/auth/login', { email, password });
    const { user, accessToken, refreshToken } = res.data;
    tokenStorage.setTokens(accessToken, refreshToken);
    tokenStorage.setUser(user);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  register: async (name, email, password) => {
    const res: any = await apiClient.post('/auth/register', {
      name,
      email,
      password,
    });
    const { user, accessToken, refreshToken } = res.data;
    tokenStorage.setTokens(accessToken, refreshToken);
    tokenStorage.setUser(user);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      tokenStorage.clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => {
    if (user) {
      tokenStorage.setUser(user);
    }
    set({ user });
  },
}));
