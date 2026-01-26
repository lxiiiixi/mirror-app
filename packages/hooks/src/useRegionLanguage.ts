import { useEffect, useRef, useState } from 'react'

export type RegionLanguage = 'zh-CN' | 'zh-HK' | 'en' | string

export interface RegionLanguageResponse {
  data?: {
    country?: string
    country_code?: string
  }
}

export interface RegionLanguageApi {
  getRegion: () => Promise<RegionLanguageResponse>
}

export interface StorageLike {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

export interface UseRegionLanguageOptions {
  api: RegionLanguageApi
  isEnabled?: boolean
  storage?: StorageLike
  regionKey?: string
  userKey?: string
  onResolve?: (language: RegionLanguage) => void
  mapCountryToLanguage?: (countryCode: string) => RegionLanguage
}

export type UseRegionLanguageStatus = 'idle' | 'loading' | 'resolved' | 'error'

export interface UseRegionLanguageState {
  status: UseRegionLanguageStatus
  language?: RegionLanguage
  error?: unknown
}

const defaultCountryToLanguage = (countryCode: string): RegionLanguage => {
  if (countryCode === 'CN') {
    return 'zh-CN'
  }
  if (countryCode === 'HK') {
    return 'zh-HK'
  }
  return 'en'
}

const resolveStorage = (storage?: StorageLike): StorageLike | undefined => {
  if (storage) {
    return storage
  }

  if (typeof window === 'undefined') {
    return undefined
  }

  return window.localStorage
}

export const useRegionLanguage = ({
  api,
  isEnabled = true,
  storage,
  regionKey = 'user-lang-region',
  userKey = 'user-lang',
  onResolve,
  mapCountryToLanguage = defaultCountryToLanguage,
}: UseRegionLanguageOptions): UseRegionLanguageState => {
  const [state, setState] = useState<UseRegionLanguageState>({ status: 'idle' })
  const apiRef = useRef(api)
  const storageRef = useRef(storage)
  const onResolveRef = useRef(onResolve)
  const mapCountryRef = useRef(mapCountryToLanguage)

  useEffect(() => {
    apiRef.current = api
  }, [api])

  useEffect(() => {
    storageRef.current = storage
  }, [storage])

  useEffect(() => {
    onResolveRef.current = onResolve
  }, [onResolve])

  useEffect(() => {
    mapCountryRef.current = mapCountryToLanguage
  }, [mapCountryToLanguage])

  useEffect(() => {
    if (!isEnabled) {
      return
    }

    const resolvedStorage = resolveStorage(storageRef.current)
    const storedLanguage = resolvedStorage?.getItem(userKey) ?? null
    const storedRegionLanguage = resolvedStorage?.getItem(regionKey) ?? null

    if (storedRegionLanguage) {
      if (!storedLanguage) {
        resolvedStorage?.setItem(userKey, storedRegionLanguage)
        onResolveRef.current?.(storedRegionLanguage)
      }

      setState({ status: 'resolved', language: storedRegionLanguage })
      return
    }

    let cancelled = false

    const detectRegion = async () => {
      setState({ status: 'loading' })

      try {
        const response = await apiRef.current.getRegion()
        const country = (
          response.data?.country ?? response.data?.country_code ?? ''
        ).toUpperCase()
        const resolvedLanguage = mapCountryRef.current(country)

        resolvedStorage?.setItem(regionKey, resolvedLanguage)

        if (!storedLanguage) {
          resolvedStorage?.setItem(userKey, resolvedLanguage)
          if (!cancelled) {
            onResolveRef.current?.(resolvedLanguage)
          }
        }

        if (!cancelled) {
          setState({ status: 'resolved', language: resolvedLanguage })
        }
      } catch (error) {
        if (!cancelled) {
          setState({ status: 'error', error })
        }
      }
    }

    void detectRegion()

    return () => {
      cancelled = true
    }
  }, [isEnabled, regionKey, userKey])

  return state
}
