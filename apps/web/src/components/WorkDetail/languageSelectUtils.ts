import type { LocalizedText, WorkDetailResponseData } from "@mirror/api";

export type LanguageSelectValue = keyof LocalizedText; // 与接口多语言 key 一致

const LANGUAGE_OPTIONS_ORDER: LanguageSelectValue[] = ["zh", "en", "zh_hant"];

const LANGUAGE_LABELS: Record<LanguageSelectValue, string> = {
    zh: "中文简体",
    en: "English",
    zh_hant: "中文繁体",
};

/** 将 LanguageSelect 的 value 转为 resolveLocalizedText 使用的语言码（如 zh-CN、zh-HK、en） */
export function languageSelectValueToI18n(value: LanguageSelectValue): string {
    if (value === "zh") return "zh-CN";
    if (value === "zh_hant") return "zh-HK";
    return value;
}

/** 将 i18n 的 language/resolvedLanguage 转为 LanguageSelect 的 value，用于默认选中当前全局语言 */
export function i18nLanguageToSelectValue(i18nLang: string | undefined): LanguageSelectValue {
    if (!i18nLang) return "zh";
    const lower = i18nLang.toLowerCase().replace(/-/g, "");
    if (lower === "zh" || lower === "zhcn") return "zh";
    if (lower === "zhhk" || lower === "zhtw" || lower === "zh_hant" || lower === "zhhant")
        return "zh_hant";
    if (lower === "en") return "en";
    return "zh";
}

/** 从多语言对象中收集有非空内容的 key */
function nonEmptyKeys(obj: LocalizedText | string | null | undefined): LanguageSelectValue[] {
    if (obj == null || typeof obj !== "object") return [];
    const keys: LanguageSelectValue[] = [];
    for (const k of LANGUAGE_OPTIONS_ORDER) {
        const v = obj[k];
        if (typeof v === "string" && v.trim() !== "") keys.push(k);
    }
    return keys;
}

/**
 * 根据作品详情接口数据，返回有内容的语言列表（用于语言选择器只展示有内容的选项）。
 * 若某语言在 work_name / work_cover_url / work_creator_name / work_description 中任一有非空值即视为可用。
 */
export function getAvailableContentLanguages(
    data: WorkDetailResponseData | null | undefined,
): LanguageSelectValue[] {
    if (!data) return [...LANGUAGE_OPTIONS_ORDER];
    const set = new Set<LanguageSelectValue>();
    for (const field of [
        data.work_name,
        data.work_cover_url,
        data.work_creator_name,
        data.work_description,
    ] as (LocalizedText | string | null | undefined)[]) {
        for (const k of nonEmptyKeys(field)) set.add(k);
    }
    const list = Array.from(set);
    return LANGUAGE_OPTIONS_ORDER.filter(k => list.includes(k));
}

/** 语言选项（value + label），可选仅包含有内容的语言 */
export function getLanguageOptions(
    available: LanguageSelectValue[] | undefined,
): { value: LanguageSelectValue; label: string }[] {
    const list = available?.length ? available : LANGUAGE_OPTIONS_ORDER;
    return list.map(value => ({ value, label: LANGUAGE_LABELS[value] }));
}
