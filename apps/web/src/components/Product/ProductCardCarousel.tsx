import { HTMLAttributes, forwardRef, useState, useEffect, useRef } from "react";
import { ProductData } from "./ProductCard";
import { ShareButton } from "./Common";
import { images } from "@mirror/assets";
import { resolveImageUrl } from "@mirror/utils";
import { getWorkTypeInfo, goToWorkDetail } from "../../utils/work";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export interface ProductCardCarouselProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * 轮播的产品列表（最多6个）
     */
    products: ProductData[];

    /**
     * 自动播放间隔（毫秒），默认5000ms
     */
    autoplayInterval?: number;

    /**
     * 是否自动播放，默认true
     */
    autoplay?: boolean;
}

/**
 * ProductCardCarousel 组件
 * 带轮播功能的大卡片组件
 */
export const ProductCardCarousel = forwardRef<HTMLDivElement, ProductCardCarouselProps>(
    ({ products, autoplayInterval = 5000, autoplay = true, className = "", ...props }, ref) => {
        const { t } = useTranslation();
        const [currentIndex, setCurrentIndex] = useState(0);
        const [expandedDesc, setExpandedDesc] = useState(false);
        const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

        const navigate = useNavigate();

        // 限制最多6个产品
        const displayProducts = products.slice(0, 6);
        const currentProduct = displayProducts[currentIndex] || displayProducts[0];

        // 自动播放逻辑
        useEffect(() => {
            if (!autoplay || displayProducts.length <= 1) return;

            autoplayTimerRef.current = setInterval(() => {
                // setCurrentIndex(prev => (prev + 1) % displayProducts.length);
            }, autoplayInterval);

            return () => {
                if (autoplayTimerRef.current) {
                    clearInterval(autoplayTimerRef.current);
                }
            };
        }, [autoplay, autoplayInterval, displayProducts.length]);

        const handleCardClick = (product: ProductData) => {
            goToWorkDetail(navigate, product.id);
        };

        // const handleShareClick = (e: React.MouseEvent, product: ProductData) => {
        //     e.stopPropagation();
        //     if (!product.shareText || !product.name) return;
        //     if (!isLoggedIn) {
        //         openLoginModal();
        //         return;
        //     }
        //     shareToX(product.shareText, product.name, true);
        //     const workId = Number(product.id);
        //     if (Number.isFinite(workId) && workId > 0) {
        //         void artsApiClient.work
        //             .share({ work_id: workId })
        //             .catch(error => console.error("[ProductCardCarousel] share failed", error));
        //     }
        // };

        const handleDotClick = (index: number) => {
            setCurrentIndex(index);
            setExpandedDesc(false);
            // 重置自动播放计时器
            if (autoplayTimerRef.current) {
                clearInterval(autoplayTimerRef.current);
            }
            if (autoplay && displayProducts.length > 1) {
                autoplayTimerRef.current = setInterval(() => {
                    setCurrentIndex(prev => (prev + 1) % displayProducts.length);
                }, autoplayInterval);
            }
        };

        const handleDescToggle = (e: React.MouseEvent) => {
            console.log("[ProductCardCarousel] handleDescToggle", e);
            e.stopPropagation();
            setExpandedDesc(prev => !prev);
        };

        if (!currentProduct || displayProducts.length === 0) return null;

        return (
            <div
                id="product_card_carousel"
                ref={ref}
                className={`relative z-5 w-full max-w-[380px] mx-auto aspect-320/430 mt-[10px] ${className}`}
                {...props}
            >
                {/* 阴影背景 */}
                <div className="absolute z-6 bottom-0 w-full h-[92%] rounded-[25px] border border-[#c81cc569] shadow-[0_0_8px_0_rgba(228,21,153,0.33)_inset] filter-[drop-shadow(0_0.6px_1.3px_rgba(0,0,0,0.41))]" />

                {/* 产品图片区域：圆角与图片一致，滚动过程中裁剪出的可见区域也保持圆角 */}
                <div className="relative z-7 w-[92.5%] h-full mx-auto overflow-hidden rounded-[26px] pb-[28px]">
                    {/* 轮播容器 - 水平滚动 */}
                    <div
                        className="flex h-[94.43%] transition-transform duration-500 ease-in-out"
                        style={{
                            transform: `translateX(-${currentIndex * 100}%)`,
                        }}
                    >
                        {displayProducts.map((product, index) => {
                            const workInfo = getWorkTypeInfo(product.type, true);
                            return (
                                <div
                                    key={product.id}
                                    className="relative shrink-0 cursor-pointer w-full"
                                    onClick={() => {
                                        setExpandedDesc(false);
                                        handleCardClick(product);
                                    }}
                                >
                                    {/* 当前显示的图片 */}
                                    <img
                                        loading="lazy"
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full rounded-[26px] object-cover bg-[#f5f5f5]"
                                        src={resolveImageUrl(product.coverUrl)}
                                        alt={product.name}
                                    />

                                    {/* 分享到X按钮 */}
                                    {/* <div
                                        className={`absolute z-8 top-[15px] left-[15px] w-[18.75%] h-[4.71%] rounded-[20px] flex justify-center items-center ${product.isShared ? "bg-[#eb1484]" : "bg-[rgba(0,0,0,0.4)]"}`}
                                        onClick={e => product.handleShareClick(e, product)}
                                    >
                                        <img
                                            src={images.works.toX}
                                            alt={t("common.xIconAlt")}
                                            className="w-[21.67%] h-[60%] mr-[8.33%]"
                                        />
                                        <img
                                            src={images.works.toXWhite}
                                            alt={t("common.xIconWhiteAlt")}
                                            className="w-[21.67%] h-[60%]"
                                        />
                                        {product.shareCount ? (
                                            <div className="absolute z-8 w-full text-center top-full text-[14px] font-medium text-white [text-shadow:0_1px_1px_rgba(35,35,35,0.8)]">
                                                {product.shareCount}
                                            </div>
                                        ) : null}
                                    </div> */}

                                    <ShareButton
                                        size="large"
                                        className="absolute z-8 top-[15px] left-[15px]"
                                        isShared={product.isShared}
                                        shareCount={product.shareCount}
                                        onClick={e => product.handleShareClick(e, product)}
                                    />

                                    {/* 作品类型 */}
                                    <div className="absolute z-8 top-[15px] h-[25px] right-[15px] flex justify-center items-center">
                                        <img
                                            className="mr-[4px] w-[16px] h-[14px] invert brightness-100"
                                            src={`${workInfo!.icon}`}
                                            alt={workInfo!.text}
                                        />
                                        <div className="text-[16px] font-normal leading-[19px] text-white [text-shadow:0_1px_1px_rgba(35,35,35,0.8)]">
                                            {workInfo!.text}
                                        </div>
                                    </div>

                                    {/* 底部内容区域 */}
                                    <div
                                        id="product_card_carousel_bottom"
                                        className={`absolute z-9 w-[94%] min-h-[21.88%] rounded-[11px] -bottom-[4.35%] left-1/2 -translate-x-1/2 p-[10px_20px] text-white border border-[rgba(67,67,67,1)] bg-[linear-gradient(180deg,rgba(127,127,127,0.33)_100%,rgba(217,217,217,0.63)_20%)] backdrop-blur-sm [text-shadow:0_2px_4px_rgba(0,0,0,0.98)] text-[12px] font-normal text-center transition-all duration-300 ${
                                            expandedDesc && index === currentIndex
                                                ? "max-h-[94.12%] overflow-y-auto"
                                                : ""
                                        }`}
                                    >
                                        <div className="text-[17px] font-semibold mb-[5px] break-all overflow-hidden line-clamp-1">
                                            《{product.name}》
                                        </div>
                                        <div className="break-all overflow-hidden line-clamp-1 mb-[5px] text-[13px]">
                                            {product.creators?.slice(0, 3).join("/") || ""}
                                        </div>
                                        {product.description && (
                                            <div
                                                className={`relative z-10 text-[11px] leading-[14px] break-all cursor-pointer text-[rgba(185,185,185,1)] ${
                                                    expandedDesc && index === currentIndex
                                                        ? ""
                                                        : "overflow-hidden line-clamp-2"
                                                }`}
                                                style={
                                                    expandedDesc && index === currentIndex
                                                        ? {
                                                              display: "block",
                                                              WebkitLineClamp: "unset",
                                                              WebkitBoxOrient: "unset",
                                                              overflow: "visible",
                                                              textOverflow: "clip",
                                                          }
                                                        : undefined
                                                }
                                                onClick={handleDescToggle}
                                            >
                                                {product.description}
                                            </div>
                                        )}
                                        <img
                                            src={images.works.descTop}
                                            className="w-[18px] h-[18px] z-11 absolute -bottom-[10px] left-1/2 -translate-x-1/2"
                                            alt="descTop"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 轮播指示器 */}
                {displayProducts.length > 1 && (
                    <div className="absolute z-7 bottom-[10px] left-1/2 -translate-x-1/2 flex gap-[6px]">
                        {displayProducts.map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleDotClick(index)}
                                className="w-[8px] h-[8px] rounded-full transition-all duration-200 p-0 cursor-pointer"
                                style={{
                                    padding: 0, //
                                    backgroundColor:
                                        index === currentIndex
                                            ? "#eb1484"
                                            : "rgba(153, 153, 153, 0.4)",
                                    border: "none",
                                    outline: "none",
                                    WebkitTapHighlightColor: "transparent",
                                    appearance: "none",
                                    WebkitAppearance: "none",
                                }}
                                aria-label={t("common.goToSlide", { index: String(index + 1) })}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    },
);

ProductCardCarousel.displayName = "ProductCardCarousel";
