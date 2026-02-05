import { WorkSummary } from "@mirror/api";
import { images } from "@mirror/assets";
import { NavigateFunction } from "react-router-dom";

/**
 * 作品类型定义
 */
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

type WorkTypeInfo = {
    type: WorkType;
    text: string;
    value: number;
    icon: string;
    isShowChapter: boolean;
    isShowTrailersStills: boolean;
};

const icons = images.works.product;

// 这块是电影的话，是只显示剧照，不显示章节。
// 那么影视剧呢是又显示剧照，又显示章节的，
// 小说和漫画只显示章节，
// 音乐的话就也是只显示章节
// 所以说剧集类的是所有展示

export const WORK_TYPE: Array<WorkTypeInfo> = [
    {
        value: 1,
        type: "animate",
        text: "Animation",
        isShowChapter: false,
        isShowTrailersStills: false,
        icon: icons.animate,
    },
    {
        value: 2,
        type: "music",
        text: "Music",
        isShowChapter: true,
        isShowTrailersStills: false,
        icon: icons.music,
    },
    {
        value: 3,
        type: "novel",
        text: "Novel",
        isShowChapter: true,
        isShowTrailersStills: false,
        icon: icons.novel,
    },
    {
        value: 4,
        type: "comic",
        text: "Comic",
        isShowChapter: true,
        isShowTrailersStills: false,
        icon: icons.comic,
    },
    {
        value: 5,
        type: "animate",
        text: "Animated Film",
        isShowChapter: false,
        isShowTrailersStills: false,
        icon: icons.animate,
    },
    {
        value: 6,
        type: "tv",
        text: "TV Drama",
        isShowChapter: true,
        isShowTrailersStills: true,
        icon: icons.tv,
    },
    {
        value: 7,
        type: "playlet",
        text: "Playlet",
        isShowChapter: true,
        isShowTrailersStills: true,
        icon: icons.playlet,
    },
    {
        value: 8,
        type: "vlog",
        text: "Vlog",
        isShowChapter: false,
        isShowTrailersStills: false,
        icon: icons.vlog,
    },
    {
        value: 9,
        type: "movie",
        text: "Movie",
        isShowChapter: false,
        isShowTrailersStills: true,
        icon: icons.regular,
    },
];

/**
 * 根据 value 获取作品类型
 */
export const getWorkTypeByValue = (value: number) => {
    return WORK_TYPE.find(item => item.value === value);
};

/**
 * 获取作品类型信息
 */
export const getWorkTypeInfo = (type: WorkType, defaultValue?: boolean) => {
    if (defaultValue) {
        return WORK_TYPE.find(item => item.type === type) || WORK_TYPE[0];
    }
    return WORK_TYPE.find(item => item.type === type);
};

export const goToWorkDetail = (
    navigate: NavigateFunction,
    id: number | string,
    rawType?: number,
) => {
    const query = rawType ? `?id=${id}&type=${rawType}` : `?id=${id}`;
    navigate(`/works/detail${query}`);
};

/**
 * 判断作品是否是 token 作品
 * @param work 作品
 * @returns 是否是 token 作品
 */
export const isTokenWork = (work: WorkSummary) => {
    const shareCount = Number(work.share_count ?? 0) || 0;
    const tokenFlag = work.token_cover_url;
    return Boolean(tokenFlag) || shareCount > 0;
};

/** 根据英文作品名取首字母：1 词→1 字母，2 词→2 字母，3 词及以上→前 3 词首字母 */
export const getWorkNameInitials = (workNameEn: string | undefined): string => {
    const trimmed = (workNameEn ?? "").trim();
    if (!trimmed) return "";
    const words = trimmed.split(/\s+/).filter(Boolean);
    const count = Math.min(words.length, 3);
    return words
        .slice(0, count)
        .map(w => (w[0] ?? "").toUpperCase())
        .join("");
};
