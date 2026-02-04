import type * as Types from "./types";

type QueryInput = object;

export function normalizeBaseUrl(baseUrl?: string) {
    if (!baseUrl) {
        return "";
    }

    return baseUrl.replace(/\/+$/, "");
}

export function buildUrl(baseUrl: string, path: string, query?: QueryInput): string {
    let normalizedPath = path.startsWith("/") ? path : `/${path}`;
    if (baseUrl && normalizedPath.startsWith("/arts") && baseUrl.endsWith("/arts")) {
        normalizedPath = normalizedPath.slice("/arts".length) || "";
        if (normalizedPath && !normalizedPath.startsWith("/")) {
            normalizedPath = `/${normalizedPath}`;
        }
    }
    const url = baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
    const queryString = query ? buildQueryString(query) : "";
    return `${url}${queryString}`;
}

function buildQueryString(params: QueryInput): string {
    const searchParams = new URLSearchParams();
    const entries = Object.entries(params as Record<string, unknown>);

    entries.forEach(([key, value]) => {
        if (value === undefined || value === null) {
            return;
        }

        if (Array.isArray(value)) {
            value.forEach(entry => {
                if (entry === undefined || entry === null) {
                    return;
                }
                searchParams.append(key, String(entry));
            });
            return;
        }

        searchParams.append(key, String(value));
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : "";
}

export function isApiResponse(value: unknown): value is Types.ApiResponse<unknown> {
    if (!value || typeof value !== "object") {
        return false;
    }

    const record = value as { code?: unknown; msg?: unknown };
    return typeof record.code === "number" && typeof record.msg === "string";
}

export function isReactNativeFile(
    value: Types.UploadFile,
): value is { uri: string; name?: string; type?: string } {
    return typeof value === "object" && value !== null && "uri" in value;
}

export function encodePathSegment(value: string | number): string {
    return encodeURIComponent(String(value));
}

export function encodePath(path: string): string {
    return path
        .split("/")
        .map(segment => encodeURIComponent(segment))
        .join("/");
}

export function normalizeLanguage(language?: Types.ArtsApiLanguage) {
    if (!language) {
        return undefined;
    }
    const raw = String(language).trim();
    if (!raw) {
        return undefined;
    }
    const lowered = raw.toLowerCase();
    if (lowered === "en" || lowered.startsWith("en-")) {
        return "en";
    }
    if (lowered === "zh" || lowered === "zh-cn" || lowered === "zh-hans") {
        return "zh-CN";
    }
    if (lowered === "zh-hk") {
        return "zh-TW";
    }
    if (lowered === "zh-tw") {
        return "zh-TW";
    }
    if (lowered === "zh-hant") {
        return "zh-Hant";
    }
    return raw;
}
