import { envConfigs } from './envConfigs'

const resolveEnvBaseUrl = () => {
  return envConfigs.ARTS_API_BASE ?? ''
}

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/+$/, '')

const stripArtsSuffix = (baseUrl: string) =>
  baseUrl.endsWith('/arts') ? baseUrl.slice(0, -5) : baseUrl

const resolveImageBaseUrl = (baseUrl?: string) => {
  if (baseUrl) {
    const normalized = normalizeBaseUrl(baseUrl)
    return normalized.endsWith('/images') ? normalized : `${normalized}/images`
  }

  const envBase = resolveEnvBaseUrl()
  if (!envBase) return ''
  const normalized = normalizeBaseUrl(stripArtsSuffix(envBase))
  return normalized.endsWith('/images') ? normalized : `${normalized}/images`
}

export const resolveImageUrl = (
  rawUrl?: string | null,
  options?: { baseUrl?: string },
) => {
  const str = rawUrl == null ? '' : typeof rawUrl === 'string' ? rawUrl : String(rawUrl)
  if (!str) return ''

  const trimmed = str.trim()
  if (!trimmed) return ''

  if (/^(https?:)?\/\//i.test(trimmed) || /^data:|^blob:/i.test(trimmed)) {
    return trimmed
  }

  const baseUrl = resolveImageBaseUrl(options?.baseUrl)
  if (!baseUrl) return trimmed

  let path = trimmed.replace(/^\/+/, '')
  if (path.startsWith('images/')) {
    path = path.slice('images/'.length)
  }

  return `${baseUrl}/${path}`
}
