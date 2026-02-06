import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "@mirror/locales/en.json";
import zhHK from "@mirror/locales/zh-HK.json";
import zhCN from "@mirror/locales/zh-CN.json";

const resources = {
    en: { common: en },
    "zh-HK": { common: zhHK },
    "zh-CN": { common: zhCN },
};

void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "en",
        supportedLngs: ["en", "zh-HK", "zh-CN"],
        defaultNS: "common",
        ns: ["common"],
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ["querystring", "localStorage", "htmlTag"],
            lookupQuerystring: "lang",
            lookupLocalStorage: "user-lang",
            caches: [],
        },
    });

export default i18n;
