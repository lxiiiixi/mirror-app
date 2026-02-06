import { useState } from "react";
import { resolveImageUrl } from "@mirror/utils";
import { images } from "@mirror/assets";
import { LanguageSelect } from "./LanguageSelect";

export interface ProductCoverProps {
    coverUrl?: string;
    title?: string;
    author?: string;
    description?: string;
    /** 是否显示封面上的播放按钮（由父组件根据作品是否包含视频/预告内容传入） */
    showPlayButton?: boolean;
}

export function ProductCover({
    coverUrl = "",
    title = "",
    author = "",
    description = "",
    showPlayButton = false,
}: ProductCoverProps) {
    const [expanded, setExpanded] = useState(false);

    const wrapperClassName = expanded
        ? "relative shrink-0 float-left w-[120px] mr-[12px] mb-[6px]"
        : "relative shrink-0 w-[120px] min-w-[120px]";

    const coverClassName = `rounded-[6px] border border-white/80 object-contain bg-[#f5f5f5] block ${
        expanded ? "w-full h-auto" : "w-[120px] min-w-[120px]"
    }`;

    return (
        <div className="relative">
            <div className="absolute top-0 right-0 z-10">
                <LanguageSelect />
            </div>
            <div id="product-cover" className={expanded ? "" : "flex items-start gap-[12px]"}>
                {/* 封面图区域：展开时由外层定宽高避免 float 导致塌陷，播放按钮才能正确叠在图上 */}
                {coverUrl ? (
                    <div className={wrapperClassName}>
                        <img className={coverClassName} src={resolveImageUrl(coverUrl)} alt={title} />
                        {showPlayButton ? (
                            <div
                                className="absolute inset-0 flex items-center justify-center rounded-[6px] bg-black/20 cursor-pointer"
                                aria-hidden
                            >
                                <img
                                    src={images.images.playVideoIcon}
                                    alt=""
                                    className="h-8 w-8 drop-shadow-md"
                                />
                            </div>
                        ) : null}
                    </div>
                ) : null}
                <div className={expanded ? "" : "flex flex-col gap-[6px]"}>
                    <div
                        className={`text-[16px] font-semibold ${expanded ? "pb-[6px]" : "line-clamp-1"}`}
                    >
                        {title}
                    </div>
                    <div
                        className={`text-[12px] text-white/70 ${expanded ? "pb-[6px]" : "line-clamp-1"}`}
                    >
                        {author}
                    </div>
                    {description ? (
                        <div
                            className={`text-[12px] leading-[16px] text-white/70 cursor-pointer ${
                                expanded ? "" : "line-clamp-7"
                            }`}
                            onClick={() => setExpanded(prev => !prev)}
                        >
                            {description}
                        </div>
                    ) : null}
                </div>
                {expanded ? <div className="clear-both" /> : null}
            </div>
        </div>
    );
}
