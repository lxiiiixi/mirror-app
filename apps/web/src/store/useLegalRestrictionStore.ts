import { create } from 'zustand'

interface LegalRestrictionState {
  open: boolean
  show: () => void
  hide: () => void
}

export const useLegalRestrictionStore = create<LegalRestrictionState>((set) => ({
  open: false,
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
}))
