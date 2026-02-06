/**
 * API 有时返回多语言对象 { en, ja, ko, zh, zh_hant }，不能直接作为 React 子节点渲染。
 * 根据当前语言取对应文案，若为字符串则直接返回。
 */
export type LocalizedText = string | Record<string, string> | null | undefined;

const LANG_TO_KEYS: Record<string, string[]> = {
  en: ['en', 'zh', 'zh_hant', 'ja', 'ko'],
  'zh-CN': ['zh', 'en', 'zh_hant', 'ja', 'ko'],
  'zh-HK': ['zh_hant', 'zh', 'en', 'ja', 'ko'],
  'zh-TW': ['zh_hant', 'zh', 'en', 'ja', 'ko'],
  ja: ['ja', 'en', 'zh', 'zh_hant', 'ko'],
  ko: ['ko', 'en', 'zh', 'zh_hant', 'ja'],
};

function getKeysForLang(lang?: string): string[] {
  if (!lang || typeof lang !== 'string') return ['en', 'zh', 'zh_hant', 'ja', 'ko'];
  const normalized = lang.trim().toLowerCase();
  if (normalized.startsWith('zh-hk') || normalized.startsWith('zh-tw')) {
    return LANG_TO_KEYS['zh-HK'];
  }
  if (normalized.startsWith('zh-cn') || normalized === 'zh') {
    return LANG_TO_KEYS['zh-CN'];
  }
  if (normalized === 'ja') return LANG_TO_KEYS.ja;
  if (normalized === 'ko') return LANG_TO_KEYS.ko;
  return LANG_TO_KEYS.en;
}

/**
 * 将 API 返回的「字符串或多语言对象」解析为当前语言下的单个字符串，避免把对象当 React 子节点渲染报错。
 * @param value work_name / work_creator_name / work_description / token_name 等
 * @param language 当前语言，如 i18n.resolvedLanguage（'en' | 'zh-CN' | 'zh-HK' 等）
 */
export function resolveLocalizedText(value: LocalizedText, language?: string): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value !== 'object') return String(value);
  const keys = getKeysForLang(language);
  for (const k of keys) {
    const v = value[k];
    if (v != null && typeof v === 'string' && v.trim() !== '') return v;
  }
  const first = Object.values(value).find(v => typeof v === 'string' && (v as string).trim() !== '');
  return typeof first === 'string' ? first : '';
}
