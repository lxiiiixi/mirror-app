import { useState } from "react";
import { resolveImageUrl } from "@mirror/utils";
import { images } from "@mirror/assets";

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

    const coverClassName = `rounded-[6px] border border-white/80 object-contain bg-[#f5f5f5] ${
        expanded ? "float-left w-[120px] mr-[12px] mb-[6px]" : "w-[120px] min-w-[120px]"
    }`;

    return (
        <div id="product-cover" className={expanded ? "" : "flex items-start gap-[12px]"}>
            {/* 封面图区域：有视频/预告内容时在图片中间显示播放图标 */}
            {coverUrl ? (
                <div className="relative shrink-0">
                    <img className={coverClassName} src={resolveImageUrl(coverUrl)} alt={title} />
                    {showPlayButton ? (
                        <div
                            className="absolute inset-0 flex items-center justify-center rounded-[6px] bg-black/20"
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
    );
}
