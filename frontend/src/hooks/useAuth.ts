import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  points: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  updatePoints: (points: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => {
        set({ token: null, user: null });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      },
      updatePoints: (points) =>
        set((state) => ({
          user: state.user ? { ...state.user, points } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);
