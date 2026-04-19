import { create } from 'zustand'

interface AuthState {
  user: { email: string; name: string; role: string } | null
  isAuthenticated: boolean
  login: (email: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (email) =>
    set({
      user: { email, name: 'Felipe (Admin)', role: 'admin' },
      isAuthenticated: true,
    }),
  logout: () => set({ user: null, isAuthenticated: false }),
}))
