import { type MouseEvent } from "react";
import { images } from "@mirror/assets";
import { useTranslation } from "react-i18next";

export type ShareButtonSize = "small" | "large";

export interface ShareButtonProps {
    /** 小尺寸（轮播卡片）/ 大尺寸（单张产品卡） */
    size?: ShareButtonSize;
    /** 是否已分享（左侧图标区是否高亮为粉色） */
    isShared?: boolean;
    /** 分享数，展示在右侧 */
    shareCount?: number;
    /** 点击回调 */
    onClick?: (e: MouseEvent) => void;
    /** 外层 class，用于定位等 */
    className?: string;
}

const sizeStyles = {
    small: {
        wrapper: "h-[12px]",
        iconArea: "pl-2 pr-1",
        icon: "w-[8px] h-[8px]",
        countArea: "pl-1 pr-1",
        count: "text-[8px]",
    },
    large: {
        wrapper: "h-[25px]",
        iconArea: "pl-4 pr-2",
        icon: "w-[13px] h-[13px]",
        countArea: "pl-1 pr-3",
        count: "text-[12px]",
    },
} as const;

/**
 * 产品卡片分享按钮：两段式胶囊（左侧图标 + 右侧分享数），支持 small / large 两种尺寸
 */
export function ShareButton({
    size = "small",
    isShared = false,
    shareCount,
    onClick,
    className = "",
}: ShareButtonProps) {
    const { t } = useTranslation();
    const styles = sizeStyles[size];

    // 有三种状态：
    // 1. 没有分享过（没有红色背景）
    // 2. 之前分享过 但是 今天没有分享过（左边图标部分是红色背景）
    // 3. 今天分享过（所有都是红色）
    return (
        <div
            role="button"
            tabIndex={0}
            className={`flex items-stretch rounded-full border border-[#eb1484] overflow-hidden cursor-pointer bg-black/50 ${styles.wrapper} ${className}`.trim()}
            onClick={onClick}
            onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick?.(e as unknown as MouseEvent);
                }
            }}
        >
            <div
                className={`flex items-center justify-center gap-1 shrink-0 rounded-full ${styles.iconArea} ${isShared ? "bg-[#eb1484]" : ""}`}
            >
                <img
                    src={images.works.toX}
                    alt={t("common.xIconAlt")}
                    className={`${styles.icon} object-contain`}
                />
                <img
                    src={images.works.toXWhite}
                    alt={t("common.xIconWhiteAlt")}
                    className={`${styles.icon} object-contain`}
                />
            </div>
            <div className={`flex items-center justify-center ${styles.countArea}`}>
                <span
                    className={`text-center font-bold text-white [text-shadow:0_1px_1px_rgba(35,35,35,0.8)] ${styles.count}`}
                >
                    {shareCount ?? "0"}
                </span>
            </div>
        </div>
    );
}
