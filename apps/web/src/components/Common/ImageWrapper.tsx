import { useId } from "react";
import type { HTMLAttributes } from "react";
import { images } from "@mirror/assets";
import { resolveImageUrl } from "@mirror/utils";

/** 相框「窗口」在 viewBox 中的内边距与圆角（与 img-wrapper 内框对齐） */
const CLIP_INSET_X = 10;
const CLIP_INSET_Y = 12;
const CLIP_RX = 8;
const CLIP_RY = 8;

export interface ImageWrapperProps extends HTMLAttributes<HTMLDivElement> {
    /** 中间展示的图片地址 */
    src: string;
    alt?: string;
    /** 是否使用相框装饰（img-wrapper 邮票齿孔边框） */
    showFrame?: boolean;
    /** 内容图在窗口内的填充方式：cover 铺满裁切 / contain 完整显示 */
    objectFit?: "cover" | "contain";
}

/**
 * 相框式图片容器：用 SVG clipPath 按边框形状裁切内容图，再叠相框装饰。
 * 内容图严格被裁在「窗口」内，不会溢出边框。
 */
export function ImageWrapper({
    src,
    alt = "",
    showFrame = true,
    objectFit = "cover",
    className = "",
    style,
    ...props
}: ImageWrapperProps) {
    const resolvedSrc = resolveImageUrl(src ?? "");
    const clipId = useId().replace(/:/g, "");

    const viewBox = "0 0 100 140";
    const clipX = CLIP_INSET_X;
    const clipY = CLIP_INSET_Y;
    const clipW = 100 - CLIP_INSET_X * 2;
    const clipH = 140 - CLIP_INSET_Y * 2;

    return (
        <div
            className={`relative overflow-hidden rounded-xl ${className}`.trim()}
            style={style}
            {...props}
        >
            <svg
                className="absolute inset-0 h-full w-full"
                viewBox={viewBox}
                preserveAspectRatio="xMidYMid meet"
                aria-hidden={!alt}
            >
                <defs>
                    <clipPath id={clipId}>
                        <rect
                            x={clipX}
                            y={clipY}
                            width={clipW}
                            height={clipH}
                            rx={CLIP_RX}
                            ry={CLIP_RY}
                        />
                    </clipPath>
                </defs>
                {/* 内容图：被 clipPath 裁成与相框窗口一致 */}
                <image
                    href={resolvedSrc}
                    x={0}
                    y={0}
                    width={100}
                    height={140}
                    preserveAspectRatio={
                        objectFit === "cover"
                            ? "xMidYMid slice"
                            : "xMidYMid meet"
                    }
                    clipPath={`url(#${clipId})`}
                />
                {/* 相框叠在上层 */}
                {showFrame ? (
                    <image
                        href={images.images.imgWrapper}
                        x={0}
                        y={0}
                        width={100}
                        height={140}
                        preserveAspectRatio="xMidYMid slice"
                    />
                ) : null}
            </svg>
            {alt ? (
                <span className="sr-only">{alt}</span>
            ) : null}
        </div>
    );
}
