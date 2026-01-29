import { useCallback, useEffect } from 'react'
import { artsApiClient } from '../api/artsClient'
import { useAuthStore } from '../store/useAuthStore'
import { useWalletStore } from '../store/useWalletStore'

const TOKEN_STORAGE_KEY = 'userToken'
const TOKEN_EXPIRY_KEY = 'timestamp'
const METHOD_STORAGE_KEY = 'loginMethod'
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

const canUseStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const clearStoredToken = () => {
  if (!canUseStorage()) return
  window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  window.localStorage.removeItem(TOKEN_EXPIRY_KEY)
  window.localStorage.removeItem(METHOD_STORAGE_KEY)
}

const readStoredToken = (): string | null => {
  if (!canUseStorage()) return null
  const token = window.localStorage.getItem(TOKEN_STORAGE_KEY)
  if (!token) return null

  const expiryRaw = window.localStorage.getItem(TOKEN_EXPIRY_KEY)
  const expiry = expiryRaw ? Number(expiryRaw) : 0
  if (expiry && Date.now() > expiry) {
    clearStoredToken()
    return null
  }

  return token
}

const readStoredLoginMethod = (): 'email' | 'wallet' | null => {
  if (!canUseStorage()) return null
  const raw = window.localStorage.getItem(METHOD_STORAGE_KEY)
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
        window.localStorage.setItem(TOKEN_STORAGE_KEY, nextToken)
        window.localStorage.setItem(
          TOKEN_EXPIRY_KEY,
          String(Date.now() + TOKEN_TTL_MS),
        )
        if (method) {
          window.localStorage.setItem(METHOD_STORAGE_KEY, method)
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
