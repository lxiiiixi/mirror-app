import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { artsApiClient } from '../api/artsClient'
import { Spinner } from '../ui'
import { resolveImageUrl } from '@mirror/utils'
import {
  Directory,
  ExternalLink,
  ProductCover,
  ProductShare,
} from '../components/WorkDetail'
import { BackButton } from '../components'

type WorkDetailData = {
  work_id?: number
  work_type?: number
  work_name?: string
  work_creator_name?: string
  work_cover_url?: string
  work_description?: string
  work_total_chapter?: number
  unlocked_chapter_count?: number
  token_name?: string
  token_balance?: number
  token_cover_url?: string
  show_token_border?: boolean | number | null
}

type MediaItem =
  | { kind: 'image'; url: string }
  | { kind: 'video'; url: string }
  | { kind: 'audio'; url: string }
  | { kind: 'embed'; url: string }

const imageExtRegex = /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i
const audioExtRegex = /\.(mp3|wav|ogg|m4a|flac)(\?.*)?$/i
const videoExtRegex = /\.(mp4|webm|mov|m3u8)(\?.*)?$/i
const embedRegex = /(youtube\.com|youtu\.be|tiktok\.com|instagram\.com)/i

function WorkDetail() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const workId = Number(searchParams.get('id') ?? '')
  const queryType = Number(searchParams.get('type') ?? '')

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [data, setData] = useState<WorkDetailData | null>(null)
  const [activePage, setActivePage] = useState(1)
  const [chapterContent, setChapterContent] = useState<string | string[] | null>('')
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [chapterLoading, setChapterLoading] = useState(false)
  const [externalLinks, setExternalLinks] = useState<
    Array<{ link_id: number; link_url: string; link_type: string }>
  >([])

  useEffect(() => {
    document.body.classList.add('work-detail-page')
    return () => {
      document.body.classList.remove('work-detail-page')
    }
  }, [])

  useEffect(() => {
    if (!workId || Number.isNaN(workId)) {
      setData(null)
      setStatus('error')
      return
    }

    let isMounted = true
    setStatus('loading')

    artsApiClient.work
      .detail({ work_id: workId })
      .then((response) => {
        if (!isMounted) return
        setData(response.data as WorkDetailData)
        setStatus('success')
      })
      .catch(() => {
        if (!isMounted) return
        setStatus('error')
      })

    return () => {
      isMounted = false
    }
  }, [workId])

  useEffect(() => {
    if (!workId || Number.isNaN(workId)) return
    artsApiClient.work
      .getExternalLinks({ work_id: workId })
      .then((response) => {
        setExternalLinks(response.data?.links ?? [])
      })
      .catch(() => {
        setExternalLinks([])
      })
  }, [workId])

  const resolvedType = Number(data?.work_type ?? queryType ?? 0)
  const isMediaWork = useMemo(
    () => [1, 2, 5, 6, 7, 8, 9].includes(resolvedType),
    [resolvedType],
  )

  useEffect(() => {
    if (!workId || Number.isNaN(workId)) return
    setChapterLoading(true)
    artsApiClient.work
      .getChapter({ work_id: workId, chapter_id: activePage })
      .then((response) => {
        const payload = response.data as { Content?: string; chapter_content?: string }
        const content = payload?.Content ?? payload?.chapter_content ?? ''
        const trimmed = content.trim()

        const parts = trimmed
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)

        const media: MediaItem[] = []
        parts.forEach((item) => {
          if (imageExtRegex.test(item)) {
            media.push({ kind: 'image', url: resolveImageUrl(item) })
            return
          }
          if (videoExtRegex.test(item)) {
            media.push({ kind: 'video', url: resolveImageUrl(item) })
            return
          }
          if (audioExtRegex.test(item)) {
            media.push({ kind: 'audio', url: resolveImageUrl(item) })
            return
          }
          if (embedRegex.test(item)) {
            media.push({ kind: 'embed', url: item })
          }
        })

        if (media.length > 0) {
          setMediaItems(media)
          setChapterContent(null)
          return
        }

        if (resolvedType === 4) {
          const images = parts.map((item) => resolveImageUrl(item))
          setChapterContent(images)
          setMediaItems([])
          return
        }

        setChapterContent(trimmed)
        setMediaItems([])
      })
      .catch(() => {
        setChapterContent('')
        setMediaItems([])
      })
      .finally(() => {
        setChapterLoading(false)
      })
  }, [activePage, resolvedType, workId])

  const showDirectory = useMemo(
    () => Number(data?.work_total_chapter ?? 0) > 1,
    [data?.work_total_chapter],
  )

  return (
    <div className="px-[15px] pb-[60px] text-white">
      <div className="flex items-center gap-[10px] py-[12px]">
        <BackButton />
      </div>

      {status === 'loading' ? (
        <div className="flex justify-center py-[30px]">
          <Spinner size="large" />
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="text-center text-[12px] text-[#999] py-[30px]">
          {t('ticket.empty')}
        </div>
      ) : null}

      {status === 'success' && data ? (
        <div className="flex flex-col gap-[16px]">
          <ProductShare
            coverUrl={data.work_cover_url}
            tokenCoverUrl={data.token_cover_url}
            tokenName={data.token_name}
            tokenBalance={data.token_balance}
            showTokenBorder={data.show_token_border}
          />

          <ExternalLink links={externalLinks} />

          <div className="rounded-[12px] bg-white/5 p-[12px]">
            <ProductCover
              coverUrl={data.work_cover_url}
              title={data.work_name}
              author={data.work_creator_name}
              description={data.work_description}
            />
          </div>

          {showDirectory ? (
            <div className="text-[12px] text-white/70">
              {t('works.detail.chapterContents', { defaultValue: 'Chapter table of contents:' })}
            </div>
          ) : null}

          {showDirectory ? (
            <Directory
              total={data.work_total_chapter}
              active={activePage}
              progress={data.unlocked_chapter_count}
              onChange={(page) => setActivePage(page)}
              onBuyChapter={(page) => setActivePage(page)}
            />
          ) : null}

          <div className="rounded-[12px] bg-white/5 p-[12px]">
            {chapterLoading ? (
              <div className="flex justify-center py-[20px]">
                <Spinner size="medium" />
              </div>
            ) : null}
            {Array.isArray(chapterContent) ? (
              <div className="flex flex-col gap-[12px]">
                {chapterContent.map((item) => (
                  <img key={item} src={item} alt="" className="w-full rounded-[8px]" />
                ))}
              </div>
            ) : null}
            {typeof chapterContent === 'string' && chapterContent ? (
              <div className="whitespace-pre-wrap text-[12px] leading-[18px] text-white/80">
                {chapterContent}
              </div>
            ) : null}
            {mediaItems.length > 0 ? (
              <div className="flex flex-col gap-[12px]">
                {mediaItems.map((item, index) => {
                  if (item.kind === 'image') {
                    return (
                      <img
                        key={`image-${index}`}
                        src={item.url}
                        alt=""
                        className="w-full rounded-[8px]"
                      />
                    )
                  }
                  if (item.kind === 'audio') {
                    return (
                      <audio key={`audio-${index}`} controls className="w-full">
                        <source src={item.url} />
                      </audio>
                    )
                  }
                  if (item.kind === 'embed') {
                    return (
                      <iframe
                        key={`embed-${index}`}
                        src={item.url}
                        className="w-full aspect-video rounded-[8px]"
                        allow="autoplay; encrypted-media"
                        title={`embed-${index}`}
                      />
                    )
                  }
                  return (
                    <video
                      key={`video-${index}`}
                      className="w-full rounded-[8px]"
                      src={item.url}
                      controls
                    />
                  )
                })}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default WorkDetail
