import { useCallback, useEffect, useRef, useState } from 'react'
import { useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { useAppKitConnection, type Provider } from '@reown/appkit-adapter-solana/react'
import { artsApiClient } from '../api/artsClient'
import { useAuth } from './useAuth'
import { useWalletStore } from '../store/useWalletStore'
import { useAlertStore } from '../store/useAlertStore'
import { envConfigs } from '@mirror/utils'

const buildLoginMessage = () => `Login Time ${Date.now()}`

const encodeSignature = (signature: Uint8Array) => {
  const binary = String.fromCharCode(...signature)
  return btoa(binary)
}

export const useWallet = () => {
  const appKit = useAppKit() as { open: () => void; disconnect?: () => Promise<void> | void }
  const { address, isConnected, status } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider<Provider>('solana')
  const { connection } = useAppKitConnection()
  const { token, loginMethod, saveToken } = useAuth()
  const showAlert = useAlertStore((state) => state.show)

  const setAddress = useWalletStore((state) => state.setAddress)
  const setConnected = useWalletStore((state) => state.setConnected)

  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const lastLoggedAddressRef = useRef<string | null>(null)
  const wasWalletLoginRef = useRef(loginMethod === 'wallet')

  useEffect(() => {
    setAddress(address ?? null)
    setConnected(Boolean(isConnected))
  }, [address, isConnected, setAddress, setConnected])

  useEffect(() => {
    wasWalletLoginRef.current = loginMethod === 'wallet'
  }, [loginMethod])

  const openWallet = useCallback(() => {
    appKit.open()
  }, [appKit])

  const disconnectWallet = useCallback(async () => {
    try {
      if (appKit.disconnect) {
        await appKit.disconnect()
      }
    } catch (error) {
      console.warn('[Wallet] appkit disconnect failed', error)
    }
    try {
      const provider = walletProvider as unknown as {
        disconnect?: () => Promise<void> | void
      }
      if (provider?.disconnect) {
        await provider.disconnect()
      }
    } catch (error) {
      console.warn('[Wallet] provider disconnect failed', error)
    }
    setAddress(null)
    setConnected(false)
    lastLoggedAddressRef.current = null
  }, [appKit.disconnect, setAddress, setConnected, walletProvider])

  const signInWithWallet = useCallback(async () => {
    if (!address || !walletProvider) return
    if (!envConfigs.SOLANA_CHAIN_ID) {
      showAlert({ message: 'Missing VITE_SOLANA_CHAIN_ID', variant: 'error' })
      return
    }

    setIsLoggingIn(true)
    try {
      const message = buildLoginMessage()
      if (!walletProvider.signMessage) {
        showAlert({ message: 'Wallet does not support message signing', variant: 'error' })
        return
      }
      const signature = await walletProvider.signMessage(new TextEncoder().encode(message))
      const sign = encodeSignature(signature)
      const inviteCode = typeof window !== 'undefined'
        ? window.localStorage.getItem('club_invite')
        : null

      const response = await artsApiClient.user.solanaWalletLogin({
        wallet_address: address,
        chain_id: envConfigs.SOLANA_CHAIN_ID,
        message,
        sign,
        ...(inviteCode ? { work_invite_code: inviteCode } : {}),
      })

      const nextToken = response.data?.token
      if (nextToken) {
        saveToken(nextToken, 'wallet')
        lastLoggedAddressRef.current = address
      }
    } catch (error) {
      console.error('[Wallet] login failed', error)
      showAlert({ message: 'Wallet login failed', variant: 'error' })
    } finally {
      setIsLoggingIn(false)
    }
  }, [address, saveToken, showAlert, walletProvider])

  useEffect(() => {
    if (!isConnected || !address || isLoggingIn) return
    if (lastLoggedAddressRef.current === address) return
    if (token && loginMethod === 'wallet') {
      lastLoggedAddressRef.current = address
      return
    }
    void signInWithWallet()
  }, [address, isConnected, isLoggingIn, loginMethod, signInWithWallet, token])

  useEffect(() => {
    if (!token) {
      lastLoggedAddressRef.current = null
    }
  }, [token])

  useEffect(() => {
    if (token || !wasWalletLoginRef.current) return
    if (!isConnected) {
      wasWalletLoginRef.current = false
      return
    }
    wasWalletLoginRef.current = false
    void disconnectWallet()
  }, [disconnectWallet, isConnected, token])

  return {
    address,
    isConnected: Boolean(isConnected),
    status,
    connection,
    isLoggingIn,
    openWallet,
    disconnectWallet,
  }
}
