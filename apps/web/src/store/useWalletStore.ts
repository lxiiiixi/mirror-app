import { create } from 'zustand'

interface WalletState {
  address: string | null
  isConnected: boolean
  setAddress: (address: string | null) => void
  setConnected: (connected: boolean) => void
  reset: () => void
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  isConnected: false,
  setAddress: (address) => set({ address }),
  setConnected: (isConnected) => set({ isConnected }),
  reset: () => set({ address: null, isConnected: false }),
}))
