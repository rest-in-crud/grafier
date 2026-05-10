import { create } from 'zustand';
import type { User } from '@/features/auth/types';

type AuthState = {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
};

const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  setUser: (user: User) => set({ user }),
  clearUser: () => set({ user: null }),
}));

export { useAuthStore };
