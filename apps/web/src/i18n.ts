import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import {
    createI18nResources,
    FALLBACK_LANGUAGE,
    SUPPORTED_LANGUAGE_LIST,
} from "@mirror/locales/i18n";
import { STORAGE_KEYS } from "./utils/localStorage";

const resources = createI18nResources("common");

void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: FALLBACK_LANGUAGE,
        supportedLngs: [...SUPPORTED_LANGUAGE_LIST],
        defaultNS: "common",
        ns: ["common"],
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ["querystring", "localStorage", "htmlTag"],
            lookupQuerystring: "lang",
            lookupLocalStorage: STORAGE_KEYS.userLang,
            caches: [],
        },
    });

export default i18n;
