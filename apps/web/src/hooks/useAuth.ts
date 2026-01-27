import { useCallback, useEffect } from 'react'
import { artsApiClient } from '../api/artsClient'
import { useAuthStore } from '../store/useAuthStore'

const TOKEN_STORAGE_KEY = 'userToken'
const TOKEN_EXPIRY_KEY = 'timestamp'
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

const canUseStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const clearStoredToken = () => {
  if (!canUseStorage()) return
  window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  window.localStorage.removeItem(TOKEN_EXPIRY_KEY)
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

export const useAuth = () => {
  const token = useAuthStore((state) => state.token)
  const hydrated = useAuthStore((state) => state.hydrated)
  const setToken = useAuthStore((state) => state.setToken)
  const clearTokenState = useAuthStore((state) => state.clearToken)
  const setHydrated = useAuthStore((state) => state.setHydrated)

  useEffect(() => {
    if (hydrated) return

    const storedToken = readStoredToken()
    if (storedToken) {
      setToken(storedToken)
    } else {
      clearStoredToken()
      clearTokenState()
    }

    setHydrated(true)
  }, [clearTokenState, hydrated, setHydrated, setToken])

  useEffect(() => {
    artsApiClient.setToken(token ?? undefined)
  }, [token])

  const saveToken = useCallback(
    (nextToken: string) => {
      if (canUseStorage()) {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, nextToken)
        window.localStorage.setItem(
          TOKEN_EXPIRY_KEY,
          String(Date.now() + TOKEN_TTL_MS),
        )
      }
      setToken(nextToken)
    },
    [setToken],
  )

  const clearToken = useCallback(() => {
    clearStoredToken()
    clearTokenState()
  }, [clearTokenState])

  return {
    token,
    hydrated,
    isLoggedIn: Boolean(token),
    saveToken,
    clearToken,
  }
}
