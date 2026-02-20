import type { LocaleMessages, SupportedLocale } from "./index";

export declare const SUPPORTED_LANGUAGES: {
  readonly en: "en";
  readonly zh_hk: "zh-HK";
  readonly zh_cn: "zh-CN";
};

export declare const SUPPORTED_LANGUAGE_LIST: readonly SupportedLocale[];

export declare const FALLBACK_LANGUAGE: SupportedLocale;

export declare function createI18nResources(
  namespace?: string,
): Record<SupportedLocale, Record<string, LocaleMessages>>;

export declare function resolveSupportedLocaleTag(
  locale: string | null | undefined,
  fallback?: SupportedLocale,
): SupportedLocale;
