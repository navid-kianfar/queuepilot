import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  expiresAt: number | null;
  setAuth: (token: string, expiresAt: number) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      expiresAt: null,
      setAuth: (token, expiresAt) => set({ token, expiresAt }),
      clearAuth: () => set({ token: null, expiresAt: null }),
    }),
    {
      name: 'queuepilot-auth',
    },
  ),
);

export function hasValidToken(): boolean {
  const { token, expiresAt } = useAuthStore.getState();
  return Boolean(token && (!expiresAt || Date.now() < expiresAt));
}
