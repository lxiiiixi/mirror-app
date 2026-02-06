/**
 * 多语言对象 key：与接口约定一致
 */
const LOCALE_KEYS = ['zh', 'zh_hant', 'en', 'ja', 'ko'] as const;

/**
 * 将 i18n 语言码映射为多语言对象的 key
 * 例如 zh-CN -> zh, zh-HK -> zh_hant, en -> en
 */
function languageToKey(lang: string): (typeof LOCALE_KEYS)[number] {
  const normalized = (lang || '').toLowerCase().replace(/-/g, '');
  if (normalized === 'zhcn' || normalized === 'zh') return 'zh';
  if (normalized === 'zhhk' || normalized === 'zhtw' || normalized === 'zh_hant' || normalized === 'zhhant') return 'zh_hant';
  if (normalized === 'en') return 'en';
  if (normalized === 'ja') return 'ja';
  if (normalized === 'ko') return 'ko';
  return 'en';
}

/**
 * 从多语言对象中按优先级取第一个非空字符串
 */
function firstNonEmpty(obj: Record<string, unknown>): string {
  for (const k of LOCALE_KEYS) {
    const v = obj[k];
    if (typeof v === 'string' && v.trim() !== '') return v.trim();
  }
  for (const v of Object.values(obj)) {
    if (typeof v === 'string' && v.trim() !== '') return v.trim();
  }
  return '';
}

/** 与 API LocalizedText 同构，用于入参类型（避免 utils 依赖 api） */
export interface LocalizedTextLike {
  zh?: string;
  zh_hant?: string;
  en?: string;
  ja?: string;
  ko?: string;
}

/**
 * 解析多语言字段为当前语言的单字符串，用于展示。
 * - 若值为 string，直接返回（兼容旧数据或单语言）。
 * - 若值为对象 { zh, zh_hant, en, ja, ko }，按 lang 取对应 key；缺省则回退到 en -> zh -> zh_hant -> ja -> ko。
 *
 * @param value 接口返回的字段（可能是 string 或多语言对象，与 API LocalizedText 兼容）
 * @param lang 当前语言，如 "zh-CN" | "en" | "zh-HK"
 * @returns 用于展示的字符串
 */
export function resolveLocalizedText(
  value: string | LocalizedTextLike | null | undefined,
  lang?: string,
): string {
  if (value == null) return '';
  if (typeof value === 'string') {
    const t = value.trim();
    return t;
  }
  if (typeof value !== 'object') return String(value);

  const key = languageToKey(lang ?? 'en');
  const preferred = value[key];
  if (typeof preferred === 'string' && preferred.trim() !== '') return preferred.trim();

  return firstNonEmpty(value);
}
