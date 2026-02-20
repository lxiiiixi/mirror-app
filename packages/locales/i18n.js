import locales from "./index.js";

export const SUPPORTED_LANGUAGES = Object.freeze({
  en: "en",
  zh_hk: "zh-HK",
  zh_cn: "zh-CN",
});

export const SUPPORTED_LANGUAGE_LIST = Object.freeze([
  SUPPORTED_LANGUAGES.en,
  SUPPORTED_LANGUAGES.zh_cn,
  SUPPORTED_LANGUAGES.zh_hk,
]);

export const FALLBACK_LANGUAGE = SUPPORTED_LANGUAGES.en;

export function createI18nResources(namespace = "common") {
  return Object.fromEntries(
    SUPPORTED_LANGUAGE_LIST.map((language) => [
      language,
      { [namespace]: locales[language] },
    ]),
  );
}

export function resolveSupportedLocaleTag(locale, fallback = FALLBACK_LANGUAGE) {
  if (!locale) return fallback;

  const normalized = String(locale).trim().toLowerCase().replace(/_/g, "-");

  if (
    normalized.startsWith("zh-hk") ||
    normalized.startsWith("zh-tw") ||
    normalized.startsWith("zh-mo") ||
    normalized.startsWith("zh-hant")
  ) {
    return SUPPORTED_LANGUAGES.zh_hk;
  }

  if (normalized.startsWith("zh")) {
    return SUPPORTED_LANGUAGES.zh_cn;
  }

  if (normalized.startsWith("en")) {
    return SUPPORTED_LANGUAGES.en;
  }

  return fallback;
}
