import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import {
  createI18nResources,
  FALLBACK_LANGUAGE,
  resolveSupportedLocaleTag,
  SUPPORTED_LANGUAGE_LIST,
} from "@mirror/locales/i18n";

const resources = createI18nResources("common");
const deviceLocale = Intl.DateTimeFormat().resolvedOptions().locale;
const initialLanguage = resolveSupportedLocaleTag(deviceLocale, FALLBACK_LANGUAGE);

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: FALLBACK_LANGUAGE,
  supportedLngs: [...SUPPORTED_LANGUAGE_LIST],
  defaultNS: "common",
  ns: ["common"],
  interpolation: {
    escapeValue: false,
  },
});

export const LANGUAGE_ORDER = [...SUPPORTED_LANGUAGE_LIST];
export default i18n;
