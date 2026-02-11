import { useCallback, useEffect } from 'react'
import { artsApiClient } from '../api/artsClient'
import { useAuthStore } from '../store/useAuthStore'
import { useWalletStore } from '../store/useWalletStore'
import {
  STORAGE_KEYS,
  canUseStorage,
  getStorageItem,
  removeStorageItem,
  setStorageItem,
} from '../utils/localStorage'
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

const clearStoredToken = () => {
  if (!canUseStorage()) return
  removeStorageItem(STORAGE_KEYS.token)
  removeStorageItem(STORAGE_KEYS.tokenExpiry)
  removeStorageItem(STORAGE_KEYS.loginMethod)
}

const readStoredToken = (): string | null => {
  if (!canUseStorage()) return null
  const token = getStorageItem(STORAGE_KEYS.token)
  if (!token) return null

  const expiryRaw = getStorageItem(STORAGE_KEYS.tokenExpiry)
  const expiry = expiryRaw ? Number(expiryRaw) : 0
  if (expiry && Date.now() > expiry) {
    clearStoredToken()
    return null
  }

  return token
}

const readStoredLoginMethod = (): 'email' | 'wallet' | null => {
  if (!canUseStorage()) return null
  const raw = getStorageItem(STORAGE_KEYS.loginMethod)
  if (raw === 'email' || raw === 'wallet') return raw
  return null
}

export const useAuth = () => {
  const token = useAuthStore((state) => state.token)
  const loginMethod = useAuthStore((state) => state.loginMethod)
  const hydrated = useAuthStore((state) => state.hydrated)
  const setToken = useAuthStore((state) => state.setToken)
  const setLoginMethod = useAuthStore((state) => state.setLoginMethod)
  const clearTokenState = useAuthStore((state) => state.clearToken)
  const setHydrated = useAuthStore((state) => state.setHydrated)
  const resetWallet = useWalletStore((state) => state.reset)

  useEffect(() => {
    if (hydrated) return

    const storedToken = readStoredToken()
    if (storedToken) {
      setToken(storedToken)
      setLoginMethod(readStoredLoginMethod())
    } else {
      clearStoredToken()
      clearTokenState()
      setLoginMethod(null)
    }

    setHydrated(true)
  }, [clearTokenState, hydrated, setHydrated, setToken])

  useEffect(() => {
    artsApiClient.setToken(token ?? undefined)
  }, [token])

  const saveToken = useCallback(
    (nextToken: string, method?: 'email' | 'wallet') => {
      if (canUseStorage()) {
        setStorageItem(STORAGE_KEYS.token, nextToken)
        setStorageItem(
          STORAGE_KEYS.tokenExpiry,
          String(Date.now() + TOKEN_TTL_MS),
        )
        if (method) {
          setStorageItem(STORAGE_KEYS.loginMethod, method)
        }
      }
      setToken(nextToken)
      if (method) {
        setLoginMethod(method)
      }
    },
    [setLoginMethod, setToken],
  )

  const clearToken = useCallback(() => {
    clearStoredToken()
    clearTokenState()
    setLoginMethod(null)
    resetWallet()
  }, [clearTokenState, resetWallet, setLoginMethod])

  return {
    token,
    loginMethod,
    hydrated,
    isLoggedIn: Boolean(token),
    isEmailLogin: loginMethod === 'email',
    setLoginMethod,
    saveToken,
    clearToken,
  }
}
