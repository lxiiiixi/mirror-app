export type WorkType =
    | "comic"
    | "novel"
    | "tv"
    | "music"
    | "vlog"
    | "animate"
    | "drama"
    | "playlet"
    | "movie";

export interface WorkTypeInfo {
    type: WorkType;
    text: string;
    value: number;
    iconKey:
        | "animate"
        | "music"
        | "novel"
        | "comic"
        | "tv"
        | "playlet"
        | "vlog"
        | "regular";
}

export const WORK_TYPE: WorkTypeInfo[] = [
    { value: 1, type: "animate", text: "Animation", iconKey: "animate" },
    { value: 2, type: "music", text: "Music", iconKey: "music" },
    { value: 3, type: "novel", text: "Novel", iconKey: "novel" },
    { value: 4, type: "comic", text: "Comic", iconKey: "comic" },
    { value: 5, type: "animate", text: "Animated Film", iconKey: "animate" },
    { value: 6, type: "tv", text: "TV Drama", iconKey: "tv" },
    { value: 7, type: "playlet", text: "Playlet", iconKey: "playlet" },
    { value: 8, type: "vlog", text: "Vlog", iconKey: "vlog" },
    { value: 9, type: "movie", text: "Movie", iconKey: "regular" },
];

export const getWorkTypeByValue = (value: number) => {
    return WORK_TYPE.find(item => item.value === value);
};

export const getWorkTypeInfo = (type: WorkType, fallback = true) => {
    const match = WORK_TYPE.find(item => item.type === type);
    if (match) {
        return match;
    }
    return fallback ? WORK_TYPE[0] : undefined;
};

export const buildWorkDetailPath = (id: number | string, rawType?: number) => {
    const query = rawType != null ? `?id=${id}&type=${rawType}` : `?id=${id}`;
    return `/works/detail${query}`;
};

export const goToWorkDetail = (
    navigate: (path: string) => void,
    id: number | string,
    rawType?: number,
) => {
    navigate(buildWorkDetailPath(id, rawType));
};

export interface TokenWorkLike {
    share_count?: number | string | null;
    token_cover_url?: unknown;
}

export const isTokenWork = (work: TokenWorkLike) => {
    const shareCount = Number(work.share_count ?? 0) || 0;
    return Boolean(work.token_cover_url) || shareCount > 0;
};

export const getWorkNameInitials = (workNameEn: string | undefined) => {
    const trimmed = (workNameEn ?? "").trim();
    if (!trimmed) {
        return "";
    }

    const words = trimmed.split(/\s+/).filter(Boolean);
    const count = Math.min(words.length, 3);
    return words
        .slice(0, count)
        .map(w => (w[0] ?? "").toUpperCase())
        .join("");
};

const CHAPTER_ENABLED_VALUES = new Set([2, 3, 4, 6, 7]);
const TRAILERS_STILLS_ENABLED_VALUES = new Set([6, 7, 9]);

export const isChapterEnabledWorkType = (value: number) => CHAPTER_ENABLED_VALUES.has(value);

export const isTrailersStillsEnabledWorkType = (value: number) =>
    TRAILERS_STILLS_ENABLED_VALUES.has(value);
