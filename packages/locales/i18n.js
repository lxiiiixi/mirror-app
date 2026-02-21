import locales from "./index.js";
import {
  SUPPORTED_LANGUAGES,
  SUPPORTED_LANGUAGE_LIST,
  FALLBACK_LANGUAGE,
} from "./constants.js";

export { SUPPORTED_LANGUAGES, SUPPORTED_LANGUAGE_LIST, FALLBACK_LANGUAGE };

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
