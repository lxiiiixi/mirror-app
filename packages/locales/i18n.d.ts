import type { SupportedLocale } from "./constants";
import type { LocaleMessages } from "./index";

export { SUPPORTED_LANGUAGES, SUPPORTED_LANGUAGE_LIST, FALLBACK_LANGUAGE } from "./constants";

export declare function createI18nResources(
  namespace?: string,
): Record<SupportedLocale, Record<string, LocaleMessages>>;

export declare function resolveSupportedLocaleTag(
  locale: string | null | undefined,
  fallback?: SupportedLocale,
): SupportedLocale;
