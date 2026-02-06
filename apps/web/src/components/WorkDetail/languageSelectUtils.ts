import { LocalizedText } from "@mirror/api";

export type LanguageSelectValue = keyof LocalizedText; // 这是后端返回接口中的key

/** 将 LanguageSelect 的 value 转为 i18n 使用的语言码（用于 changeLanguage） */
export function languageSelectValueToI18n(value: LanguageSelectValue): string {
    if (value === "zh") return "zh-CN";
    return value;
}

/** 将 i18n 的 language/resolvedLanguage 转为 LanguageSelect 的 value */
export function i18nLanguageToSelectValue(i18nLang: string | undefined): LanguageSelectValue {
    if (!i18nLang) return "en";
    const lower = i18nLang.toLowerCase();
    if (lower === "zh" || lower.startsWith("zh-cn") || lower.startsWith("zhcn")) return "zh";
    if (
        lower.startsWith("zh-hk") ||
        lower.startsWith("zh-tw") ||
        lower.startsWith("zhhk") ||
        lower.startsWith("zhtw")
    )
        return "zh";
    if (lower === "en") return "en";
    // if (lower === "ko") return "ko";
    // if (lower === "ja") return "ja";
    return "zh";
}
