export type LocaleMessages = Record<string, unknown>;

declare const locales: {
  en: LocaleMessages;
  "zh-CN": LocaleMessages;
  "zh-HK": LocaleMessages;
};

export type SupportedLocale = keyof typeof locales;

export default locales;
