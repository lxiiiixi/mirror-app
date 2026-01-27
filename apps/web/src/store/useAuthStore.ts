import { create } from 'zustand'

interface AuthState {
  token: string | null
  hydrated: boolean
  setToken: (token: string | null) => void
  clearToken: () => void
  setHydrated: (hydrated: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  hydrated: false,
  setToken: (token) => set({ token }),
  clearToken: () => set({ token: null }),
  setHydrated: (hydrated) => set({ hydrated }),
}))
