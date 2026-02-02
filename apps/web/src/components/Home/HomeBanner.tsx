import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { Banner as UIBanner } from '../../ui'
import type { BannerItem } from '../../ui'
import { images } from '@mirror/assets'

const bannerImageMap = images.banner as Record<string, string>

interface HomeBannerProps {
  autoplay?: boolean
  interval?: number
  className?: string
}

type BannerLocaleItem = {
  id?: string | number
  img: string
  link?: string
  alt?: string
}

const LOCALE_SUFFIXES = ['_cn', '_hk', '_en'] as const

/** 从 img key 解析出 slot 名，如 banner4_cn -> banner4 */
function getBannerSlot(key: string): string {
  for (const suf of LOCALE_SUFFIXES) {
    if (key.endsWith(suf)) return key.slice(0, -suf.length)
  }
  return key
}

/**
 * 解析 banner 图片：优先用配置的 key，不存在则按 slot 用「当前语言 -> 其它语言 -> 无后缀」顺序 fallback
 */
function resolveBannerSrc(imgKey: string, language: string): string {
  if (imgKey in bannerImageMap) return bannerImageMap[imgKey]
  const slot = getBannerSlot(imgKey)
  const langSuffix = language === 'zh-CN' ? '_cn' : language === 'zh-HK' || language === 'zh-TW' ? '_hk' : '_en'
  const fallbackKeys = [
    slot + langSuffix,
    ...LOCALE_SUFFIXES.filter(s => s !== langSuffix).map(s => slot + s),
    slot,
  ]
  for (const k of fallbackKeys) {
    if (k in bannerImageMap) return bannerImageMap[k]
  }
  return imgKey
}

export function Banner({ autoplay = false, interval = 6000, className = '' }: HomeBannerProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const banners = useMemo<BannerItem[]>(() => {
    const raw = t('banners', { returnObjects: true }) as BannerLocaleItem[] | string
    if (!Array.isArray(raw)) return []
    const lang = i18n.language || i18n.resolvedLanguage || 'en'
    return raw.map((item, index) => ({
      id: item.id ?? index,
      img: resolveBannerSrc(item.img, lang),
      link: item.link,
      alt: item.alt,
    }))
  }, [t, i18n.language, i18n.resolvedLanguage])

  const handleCardClick = (banner: BannerItem) => {
    if (!banner.link) return
    if (/^https?:\/\//i.test(banner.link)) {
      window.location.href = banner.link
      return
    }
    navigate(banner.link)
  }

  return (
    <UIBanner
      className={className}
      banners={banners}
      autoplay={autoplay}
      interval={interval}
      onCardClick={handleCardClick}
    />
  )
}
