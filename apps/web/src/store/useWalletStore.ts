import { create } from 'zustand'

interface WalletState {
  address: string | null
  isConnected: boolean
  disconnectRequested: boolean
  setAddress: (address: string | null) => void
  setConnected: (connected: boolean) => void
  requestDisconnect: () => void
  clearDisconnectRequest: () => void
  reset: () => void
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  isConnected: false,
  disconnectRequested: false,
  setAddress: (address) => set({ address }),
  setConnected: (isConnected) => set({ isConnected }),
  requestDisconnect: () => set({ disconnectRequested: true }),
  clearDisconnectRequest: () => set({ disconnectRequested: false }),
  reset: () => set({ address: null, isConnected: false, disconnectRequested: false }),
}))
