import { images } from "@mirror/assets";

/**
 * 作品类型定义
 */
export type WorkType =
    | "comic"
    | "novel"
    | "movie"
    | "tv"
    | "music"
    | "vlog"
    | "animate"
    | "drama"
    | "playlet"
    | "regular";

export const workTypeMap: Record<number, WorkType> = {
    1: "animate",
    2: "music",
    3: "novel",
    4: "comic",
    5: "animate",
    6: "tv",
    7: "playlet",
    8: "vlog",
    9: "regular",
};

/**
 * 获取作品类型信息
 */
export const getWorkTypeInfo = (type: WorkType) => {
    const typeMap: Record<WorkType, { text: string; icon: string }> = {
        comic: { text: "Comic", icon: images.works.product.comic },
        novel: { text: "Novel", icon: images.works.product.novel },
        movie: { text: "Movie", icon: images.works.product.movie },
        tv: { text: "TV", icon: images.works.product.tv },
        music: { text: "Music", icon: images.works.product.music },
        vlog: { text: "Vlog", icon: images.works.product.vlog },
        animate: { text: "Animate", icon: images.works.product.animate },
        drama: { text: "Drama", icon: images.works.product.drama },
        playlet: { text: "Playlet", icon: images.works.product.playlet },
        regular: { text: "Regular", icon: images.works.product.regular },
    };
    return typeMap[type] || typeMap.comic;
};
