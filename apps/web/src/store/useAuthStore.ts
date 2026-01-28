import { create } from 'zustand'

interface AuthState {
  token: string | null
  loginMethod: 'email' | 'wallet' | null
  hydrated: boolean
  setToken: (token: string | null) => void
  setLoginMethod: (method: 'email' | 'wallet' | null) => void
  clearToken: () => void
  setHydrated: (hydrated: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  loginMethod: null,
  hydrated: false,
  setToken: (token) => set({ token }),
  setLoginMethod: (method) => set({ loginMethod: method }),
  clearToken: () => set({ token: null }),
  setHydrated: (hydrated) => set({ hydrated }),
}))
