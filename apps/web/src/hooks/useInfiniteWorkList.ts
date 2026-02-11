import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  ArtsApiClient,
  WorkListParams,
  WorkListResponseData,
  WorkSummary,
} from '@mirror/api'
import { artsApiClient } from '../api/artsClient'

export type InfiniteWorkListStatus = 'idle' | 'loading' | 'loadingMore' | 'success' | 'error'

export interface UseInfiniteWorkListOptions {
  pageSize?: number
  initialPage?: number
  initialItems?: WorkSummary[]
  initialTotal?: number
  initialHasMore?: boolean
  initialStatus?: InfiniteWorkListStatus
  filters?: Omit<WorkListParams, 'page' | 'page_size'>
  enabled?: boolean
  autoLoad?: boolean
  scrollElement?: ScrollElement | null
  scrollThreshold?: number
  retainOnRefresh?: boolean
  client?: Pick<ArtsApiClient, 'work'>
}

export interface UseInfiniteWorkListResult {
  items: WorkSummary[]
  total: number
  page: number
  status: InfiniteWorkListStatus
  error?: unknown
  hasMore: boolean
  isLoading: boolean
  isLoadingMore: boolean
  loadMore: () => void
  refresh: () => void
  setScrollElement: (element: ScrollElement | null) => void
}

type ScrollElement = Window | HTMLElement

type WorkListResponse = WorkListResponseData

const defaultClient: Pick<ArtsApiClient, 'work'> = artsApiClient

const isWindowElement = (element: ScrollElement): element is Window =>
  typeof window !== 'undefined' && element === window

const resolveScrollMetrics = (element: ScrollElement) => {
  if (isWindowElement(element)) {
    const doc = document.documentElement
    const body = document.body
    const scrollTop = window.scrollY || doc.scrollTop || body.scrollTop || 0
    const clientHeight = window.innerHeight || doc.clientHeight || 0
    const scrollHeight = doc.scrollHeight || body.scrollHeight || 0
    return { scrollTop, clientHeight, scrollHeight }
  }

  const container = element as HTMLElement
  return {
    scrollTop: container.scrollTop,
    clientHeight: container.clientHeight,
    scrollHeight: container.scrollHeight,
  }
}

export const useInfiniteWorkList = (
  {
    pageSize = 12,
    initialPage = 1,
    initialItems,
    initialTotal,
    initialHasMore,
    initialStatus,
    filters,
    enabled = true,
    autoLoad = true,
    scrollElement = null,
    scrollThreshold = 160,
    retainOnRefresh = false,
    client = defaultClient,
  }: UseInfiniteWorkListOptions = {},
): UseInfiniteWorkListResult => {
  const [items, setItems] = useState<WorkSummary[]>(initialItems ?? [])
  const [total, setTotal] = useState(initialTotal ?? 0)
  const [page, setPage] = useState(initialPage)
  const [status, setStatus] = useState<InfiniteWorkListStatus>(
    initialStatus ?? 'idle',
  )
  const [error, setError] = useState<unknown>(undefined)
  const [hasMore, setHasMore] = useState(
    typeof initialHasMore === 'boolean' ? initialHasMore : true,
  )
  const [currentScrollElement, setScrollElement] = useState<ScrollElement | null>(
    scrollElement,
  )

  const inFlightRef = useRef(false)
  const filtersKey = useMemo(() => JSON.stringify(filters ?? {}), [filters])
  const filtersRef = useRef(filters ?? {})
  const clientRef = useRef(client)

  useEffect(() => {
    filtersRef.current = filters ?? {}
  }, [filtersKey])

  useEffect(() => {
    clientRef.current = client
  }, [client])

  useEffect(() => {
    setScrollElement(scrollElement)
  }, [scrollElement])

  const fetchPage = useCallback(
    async (targetPage: number, append: boolean) => {
      console.log('[useInfiniteWorkList] fetchPage', { targetPage, append })
      if (!enabled || inFlightRef.current) {
        return
      }

      inFlightRef.current = true
      setStatus(append ? 'loadingMore' : 'loading')
      setError(undefined)

      try {
        const response = await clientRef.current.work.list({
          page: targetPage,
          page_size: pageSize,
          ...(filtersRef.current ?? {}),
        })

        const payload = response.data as WorkListResponse
        setItems((prev) => {
          const nextItems = append ? [...prev, ...payload.list] : payload.list
          const rawTotal = (payload as { total?: number | string }).total
          const totalNumber =
            typeof rawTotal === 'number' || typeof rawTotal === 'string'
              ? Number(rawTotal)
              : NaN
          const hasValidTotal = Number.isFinite(totalNumber) && totalNumber >= 0
          setHasMore(
            hasValidTotal ? nextItems.length < totalNumber : payload.list.length === pageSize,
          )
          return nextItems
        })
        setTotal(
          typeof payload.total === 'number'
            ? payload.total
            : typeof payload.total === 'string'
              ? Number(payload.total) || 0
              : payload.list.length,
        )
        setPage(targetPage)
        setStatus('success')
      } catch (err) {
        setError(err)
        setStatus('error')
      } finally {
        inFlightRef.current = false
      }
    },
    [enabled, pageSize],
  )

  const refresh = useCallback(() => {
    console.log('[useInfiniteWorkList] refresh')
    if (!retainOnRefresh) {
      setItems([])
      setTotal(0)
      setPage(initialPage)
      setHasMore(true)
    }
    void fetchPage(initialPage, false)
  }, [fetchPage, initialPage, retainOnRefresh])

  const loadMore = useCallback(() => {
    if (!enabled || !hasMore || inFlightRef.current) {
      return
    }

    void fetchPage(page + 1, true)
  }, [enabled, fetchPage, hasMore, page])

  useEffect(() => {
    if (!enabled || !autoLoad) {
      return
    }

    refresh()
  }, [autoLoad, enabled, filtersKey, refresh])

  useEffect(() => {
    if (!enabled || !currentScrollElement) {
      return
    }

    const handleScroll = () => {
      if (!hasMore || inFlightRef.current) {
        return
      }

      const { scrollTop, clientHeight, scrollHeight } = resolveScrollMetrics(
        currentScrollElement,
      )
      if (scrollTop + clientHeight >= scrollHeight - scrollThreshold) {
        loadMore()
      }
    }

    currentScrollElement.addEventListener('scroll', handleScroll, {
      passive: true,
    })

    return () => {
      currentScrollElement.removeEventListener('scroll', handleScroll)
    }
  }, [currentScrollElement, enabled, hasMore, loadMore, scrollThreshold])

  const isLoading = status === 'loading'
  const isLoadingMore = status === 'loadingMore'

  return {
    items,
    total,
    page,
    status,
    error,
    hasMore,
    isLoading,
    isLoadingMore,
    loadMore,
    refresh,
    setScrollElement,
  }
}
