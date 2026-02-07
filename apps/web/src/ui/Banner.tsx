import { HTMLAttributes, forwardRef, useState, useEffect, useRef, useCallback } from "react";

/**
 * Banner 数据接口
 */
export interface BannerItem {
    id: string | number;
    img: string;
    link?: string;
    alt?: string;
}

export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "onClick"> {
    /**
     * Banner 数据列表
     */
    banners: BannerItem[];

    /**
     * 是否开启自动轮播
     */
    autoplay?: boolean;

    /**
     * 自动轮播间隔时间(毫秒)，最小 1000ms
     */
    interval?: number;

    /**
     * 点击激活卡片的回调
     */
    onCardClick?: (banner: BannerItem) => void;
}

/**
 * Banner 组件
 * 2D 堆叠轮播效果
 */
export const Banner = forwardRef<HTMLDivElement, BannerProps>(
    (
        { banners, autoplay = false, interval = 6000, onCardClick, className = "", ...props },
        ref,
    ) => {
        const [currentIndex, setCurrentIndex] = useState(0);
        const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

        // 触摸滑动相关
        const touchStartXRef = useRef(0);
        const touchStartYRef = useRef(0);
        const isSwipingRef = useRef(false);

        // 常量配置
        const SCALE_RATIO = 0.9; // 缩放系数
        const LEVEL = 2; // 左右各2层堆叠

        /**
         * 计算卡片样式
         */
        const getCardStyle = useCallback(
            (index: number): React.CSSProperties => {
                const total = banners.length;
                const diff = (index - currentIndex + total) % total;

                // 当前激活卡片
                if (diff === 0) {
                    return {
                        transform: "translateX(-50%) translateY(-50%) scale(1.1)",
                        opacity: 1,
                        zIndex: total, // 最高层级
                    };
                }

                // 右侧堆叠层
                if (diff >= 1 && diff <= LEVEL) {
                    const level = diff;
                    const scale = Math.pow(SCALE_RATIO, level);

                    // 手动设置每个level的offsetX (rpx转px: 除以2)
                    const offsetXMap: Record<number, number> = {
                        1: -53, // -86rpx / 2
                        2: -75, // -130rpx / 2
                    };
                    const offsetX = offsetXMap[level] || 0;

                    const opacityMap: Record<number, number> = {
                        1: 1,
                        2: 0.6,
                    };
                    const zIndex = total - level; // z-index递减

                    return {
                        transform: `translateX(-50%) translateY(-50%) translateX(${offsetX}px) scale(${scale})`,
                        opacity: opacityMap[level],
                        zIndex: zIndex,
                    };
                }

                // 左侧堆叠层
                if (diff >= total - LEVEL) {
                    const level = total - diff; // 计算左侧层级 (1或2)
                    const scale = Math.pow(SCALE_RATIO, level);

                    // 手动设置每个level的offsetX(左侧为正值)
                    const offsetXMap: Record<number, number> = {
                        1: 53, // 86rpx / 2
                        2: 75, // 130rpx / 2
                    };
                    const offsetX = offsetXMap[level] || 0;

                    const opacityMap: Record<number, number> = {
                        1: 1,
                        2: 0.6,
                    };
                    const zIndex = total - level;

                    return {
                        transform: `translateX(-50%) translateY(-50%) translateX(${offsetX}px) scale(${scale})`,
                        opacity: opacityMap[level],
                        zIndex: zIndex,
                    };
                }

                // 超出显示范围的卡片完全隐藏
                return {
                    transform: "translateX(-50%) translateY(-50%) scale(0.5)",
                    opacity: 0,
                    zIndex: 0,
                    pointerEvents: "none",
                };
            },
            [currentIndex, banners.length],
        );

        /**
         * 触摸开始
         */
        const handleTouchStart = (e: React.TouchEvent) => {
            touchStartXRef.current = e.touches[0].clientX;
            touchStartYRef.current = e.touches[0].clientY;
            isSwipingRef.current = false;
            stopAutoplay();
        };

        /**
         * 触摸移动
         */
        const handleTouchMove = (e: React.TouchEvent) => {
            if (!touchStartXRef.current) return;

            const deltaX = Math.abs(e.touches[0].clientX - touchStartXRef.current);
            const deltaY = Math.abs(e.touches[0].clientY - touchStartYRef.current);

            // 如果水平滑动距离大于垂直滑动距离，认为是水平滑动
            if (deltaX > deltaY && deltaX > 10) {
                isSwipingRef.current = true;
            }
        };

        /**
         * 触摸结束
         */
        const handleTouchEnd = (e: React.TouchEvent) => {
            if (!touchStartXRef.current || !isSwipingRef.current) {
                startAutoplay();
                return;
            }

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            handleSwipe(touchEndX, touchEndY);

            // 重置
            touchStartXRef.current = 0;
            touchStartYRef.current = 0;
            isSwipingRef.current = false;

            startAutoplay();
        };

        /**
         * 处理滑动
         */
        const handleSwipe = (touchEndX: number, touchEndY: number) => {
            const deltaX = touchEndX - touchStartXRef.current;
            const deltaY = Math.abs(touchEndY - touchStartYRef.current);

            // 确保是水平滑动且滑动距离足够
            if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > deltaY) {
                const total = banners.length;

                if (deltaX > 0) {
                    // 向右滑动，显示上一张
                    setCurrentIndex((currentIndex - 1 + total) % total);
                } else {
                    // 向左滑动，显示下一张
                    setCurrentIndex((currentIndex + 1) % total);
                }
            }
        };

        /**
         * 处理卡片点击
         */
        const handleCardClick = (banner: BannerItem, index: number) => {
            // 如果正在滑动，不触发点击
            if (isSwipingRef.current) return;

            if (index === currentIndex) {
                // 点击当前激活卡片，触发回调
                onCardClick?.(banner);
            } else {
                // 点击非激活卡片，切换到该卡片
                goToSlide(index);
            }
        };

        /**
         * 切换到指定幻灯片
         */
        const goToSlide = (index: number) => {
            setCurrentIndex(index);
            resetAutoplay();
        };

        /**
         * 开始自动播放
         */
        const startAutoplay = useCallback(() => {
            if (!autoplay) return;

            stopAutoplay();
            autoplayTimerRef.current = setInterval(
                () => {
                    setCurrentIndex(prev => (prev + 1) % banners.length);
                },
                Math.max(interval, 1000),
            ); // 最小间隔 1000ms
        }, [autoplay, interval, banners.length]);

        /**
         * 停止自动播放
         */
        const stopAutoplay = () => {
            if (autoplayTimerRef.current) {
                clearInterval(autoplayTimerRef.current);
                autoplayTimerRef.current = null;
            }
        };

        /**
         * 重置自动播放
         */
        const resetAutoplay = () => {
            stopAutoplay();
            startAutoplay();
        };

        // 监听 autoplay 和 interval 变化
        useEffect(() => {
            if (autoplay) {
                startAutoplay();
            } else {
                stopAutoplay();
            }

            return () => {
                stopAutoplay();
            };
        }, [autoplay, startAutoplay]);

        return (
            <div ref={ref} className={`banner-container ${className}`} {...props}>
                {/* 2D堆叠轮播 */}
                <div
                    className="banner-2d-scene"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div className="banner-2d-wrapper">
                        {banners.map((banner, index) => (
                            <div
                                key={banner.id}
                                className={`banner-card-2d ${index === currentIndex ? "active" : ""}`}
                                style={getCardStyle(index)}
                                onClick={() => handleCardClick(banner, index)}
                            >
                                <img
                                    className="banner-image"
                                    src={banner.img}
                                    alt={banner.alt || `Banner ${index + 1}`}
                                />
                                <div className="card-overlay" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* 自定义指示器 */}
                <div className="custom-indicators">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            className={`indicator-dot ${index === currentIndex ? "active" : ""}`}
                            onClick={() => goToSlide(index)}
                            style={{
                                padding: 0,
                                border: "none",
                                outline: "none",
                                WebkitTapHighlightColor: "transparent",
                                appearance: "none",
                                WebkitAppearance: "none",
                            }}
                            aria-label={`Go to banner ${index + 1}`}
                        />
                    ))}
                </div>

                <style jsx>{`
                    .banner-container {
                        overflow: hidden;
                    }

                    /* 场景高度完全按视口宽度比例：卡片高 ≈ 68vw * (129/267)，取 50vw 留余量 */
                    .banner-2d-scene {
                        width: 100%;
                        height: clamp(140px, 42vw, 300px);
                        position: relative;
                        touch-action: pan-y;
                    }

                    .banner-2d-wrapper {
                        width: 100%;
                        height: 100%;
                        position: relative;
                    }

                    /* 卡片宽度完全按视口比例，高度由 aspect-ratio 随宽度成比例 */
                    .banner-card-2d {
                        position: absolute;
                        left: 50%;
                        top: 50%;
                        width: clamp(220px, 68vw, 420px);
                        aspect-ratio: 267 / 129;
                        transition: all 0.5s ease;
                        cursor: pointer;
                        border-radius: 16px;
                    }

                    /* 2D 发光边框效果 */
                    .banner-card-2d::before {
                        content: "";
                        position: absolute;
                        inset: -0.5px;
                        border-radius: 16px;
                        padding: 0.5px;
                        background: linear-gradient(
                            135deg,
                            rgba(255, 205, 244, 0.5),
                            rgba(255, 205, 244, 0.3)
                        );
                        -webkit-mask:
                            linear-gradient(#fff 0 0) content-box,
                            linear-gradient(#fff 0 0);
                        -webkit-mask-composite: xor;
                        mask-composite: exclude;
                        pointer-events: none;
                        z-index: 1;
                    }

                    .banner-card-2d.active::before {
                        background: linear-gradient(
                            135deg,
                            rgba(255, 205, 244, 0.8),
                            rgba(255, 205, 244, 0.5)
                        );
                    }

                    .banner-card-2d.active .card-overlay {
                        opacity: 0;
                    }

                    .banner-image {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        display: block;
                        border-radius: 16px;
                        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
                    }

                    .card-overlay {
                        position: absolute;
                        inset: 0;
                        background: linear-gradient(
                            to bottom,
                            rgba(0, 0, 0, 0.1) 0%,
                            rgba(0, 0, 0, 0.3) 100%
                        );
                        transition: opacity 0.3s ease;
                        pointer-events: none;
                        border-radius: 16px;
                    }

                    .custom-indicators {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 4px;
                    }

                    .indicator-dot {
                        width: 5px;
                        height: 5px;
                        border-radius: 50%;
                        background: rgba(153, 153, 153, 0.5);
                        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                        cursor: pointer;
                    }

                    .indicator-dot.active {
                        width: 10px;
                        border-radius: 4px;
                        background: #fff;
                        box-shadow: 0 0 8px rgba(235, 20, 132, 0.4);
                    }

                    .indicator-dot:hover:not(.active) {
                        transform: scale(1.3);
                        background: rgba(235, 20, 132, 0.6);
                    }

                    /* 小屏圆角略小 */
                    @media (max-width: 600px) {
                        .banner-card-2d {
                            border-radius: 12px;
                        }

                        .banner-card-2d::before {
                            border-radius: 12px;
                        }

                        .banner-image {
                            border-radius: 12px;
                        }

                        .card-overlay {
                            border-radius: 12px;
                        }
                    }
                `}</style>
            </div>
        );
    },
);

Banner.displayName = "Banner";
