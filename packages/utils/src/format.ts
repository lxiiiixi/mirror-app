/**
 * 数字与金额、日期等展示用格式化工具，统一千分位、小数位与空值表现。
 */

/**
 * 将数字格式化为带千分位的字符串，空值返回 "0"。
 * 不限制小数位，由 toLocaleString 使用默认小数位。
 *
 * @param value - 数字或可转为数字的字符串，支持 undefined / null
 * @returns 千分位字符串，如 "1,234,567" 或 "1,234.56"
 *
 * @example
 * formatNumber(1234567)   // "1,234,567"
 * formatNumber(null)     // "0"
 * formatNumber("12.5")    // "12.5"
 */
export function formatNumber(value?: number | string | null): string {
    if (value === undefined || value === null) return "0";
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return String(value);
    return numeric.toLocaleString();
}

/**
 * 将数字格式化为带千分位和指定小数位的字符串，空值返回 "0"。
 * 适用于金额、数量等需要固定小数位的展示。
 *
 * @param value - 数字或可转为数字的字符串，支持 undefined / null
 * @param maximumFractionDigits - 最大小数位数，默认 4
 * @returns 千分位字符串，如 "1,234.5678"
 *
 * @example
 * formatAmount(1234.56789)           // "1,234.5679"
 * formatAmount(1234.56789, 2)        // "1,234.57"
 * formatAmount(null)                 // "0"
 */
export function formatAmount(
    value?: number | string | null,
    maximumFractionDigits = 4
): string {
    if (value === undefined || value === null || value === "") return "0";
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) return String(value);
    return numberValue.toLocaleString(undefined, {
        maximumFractionDigits,
    });
}

/**
 * 将「千分单位」的奖励值转为实际数值（除以 1000），并保留最多 3 位小数。
 * 用于后端返回的毫级/千分单位与前端展示单位的转换。
 *
 * @param reward - 千分单位的数字或字符串，如 1500 表示 1.5
 * @returns 转换后的数值，非数字或空值返回 0
 *
 * @example
 * formatReward(1500)   // 1.5
 * formatReward("2000") // 2
 */
export function formatReward(reward?: string | number | null): number {
    const raw = Number(reward ?? 0);
    if (!Number.isFinite(raw)) return 0;
    const value = raw / 1000;
    return Math.round(value * 1000) / 1000;
}

/**
 * 将长地址缩短为「前若干位 + 分隔符 + 后若干位」的展示形式。
 * 常用于钱包地址、交易哈希等。
 *
 * @param address - 原始地址字符串
 * @param headLength - 保留前几位，默认 6
 * @param tailLength - 保留后几位，默认 4
 * @param separator - 中间分隔符，默认 "..."
 * @returns 缩短后的字符串，长度不足时返回原串
 *
 * @example
 * formatShortAddress("0x1234567890abcdef1234")     // "0x1234...1234"
 * formatShortAddress("0x1234567890abcdef1234", 3, 4, "***")  // "0x1***1234"
 * formatShortAddress("short")                      // "short"
 */
export function formatShortAddress(
    address?: string | number | null,
    headLength = 6,
    tailLength = 4,
    separator = "..."
): string {
    if (address === undefined || address === null) return "";
    const text = String(address).trim();
    if (text.length <= headLength + tailLength) return text;
    return `${text.slice(0, headLength)}${separator}${text.slice(-tailLength)}`;
}

/**
 * 将日期字符串格式化为 YYYY.MM.DD。
 *
 * @param value - 日期字符串或 ISO 字符串，支持 undefined / null
 * @returns "YYYY.MM.DD"，无效日期返回原字符串
 *
 * @example
 * formatDate("2025-06-30")        // "2025.06.30"
 * formatDate("2025-06-30T12:00")  // "2025.06.30"
 */
export function formatDate(value?: string | null): string {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}.${month}.${day}`;
}

/**
 * 将 ISO 日期时间字符串格式化为 "YYYY-MM-DD HH:mm:ss"（去掉 T 和毫秒/时区）。
 *
 * @param value - ISO 日期时间字符串，如 "2025-06-30T12:00:00.000Z"
 * @returns "YYYY-MM-DD HH:mm:ss"，空值返回 ""
 *
 * @example
 * formatDateTime("2025-06-30T12:00:00.000Z")  // "2025-06-30 12:00:00"
 */
export function formatDateTime(value?: string | null): string {
    if (!value) return "";
    return value.replace("T", " ").substring(0, 19);
}

/**
 * 将数字格式化为带千分位和小数位的字符串，空值或 0 或非数字返回占位符。
 * 适用于「有值才展示、无值显示 -」的列表/详情。
 *
 * @param value - 数字或可转为数字的字符串
 * @param maximumFractionDigits - 最大小数位数，默认 6
 * @param emptyPlaceholder - 空/0/无效时的占位符，默认 "-"
 * @returns 千分位字符串或占位符
 *
 * @example
 * formatDisplayNumber(1234.5)      // "1,234.5"
 * formatDisplayNumber(0)           // "-"
 * formatDisplayNumber(null, 4)    // "-"
 */
export function formatDisplayNumber(
    value?: number | string | null,
    maximumFractionDigits = 6,
    emptyPlaceholder = "-"
): string {
    if (value === undefined || value === null || value === "") return emptyPlaceholder;
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue) || numberValue === 0) return emptyPlaceholder;
    return numberValue.toLocaleString(undefined, {
        maximumFractionDigits,
    });
}

/**
 * 将数字格式化为带美元前缀的金额字符串，空/0/无效返回 "-"。
 *
 * @param value - 数字或可转为数字的字符串
 * @param maximumFractionDigits - 最大小数位数，默认 6
 * @returns 如 "$1,234.56" 或 "-"
 *
 * @example
 * formatCurrency(1234.5)   // "$1,234.5"
 * formatCurrency(0)        // "-"
 */
export function formatCurrency(
    value?: number | string | null,
    maximumFractionDigits = 6
): string {
    const text = formatDisplayNumber(value, maximumFractionDigits, "-");
    return text === "-" ? "-" : `$${text}`;
}
