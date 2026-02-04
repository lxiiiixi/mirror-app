import { HTMLAttributes, forwardRef } from "react";
import { images } from "@mirror/assets";
import { resolveImageUrl, shareToX } from "@mirror/utils";
import { getWorkTypeInfo, goToWorkDetail, WorkType } from "../utils/work";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLoginModalStore } from "../store/useLoginModalStore";

/**
 * 产品数据接口
 */
export interface ProductData {
    id: string | number;
    name: string;
    coverUrl: string;
    type: WorkType;
    shareLink: string;
    shareCount?: number;
    likeCount?: number;
    creators?: string[]; // 作者/创作者列表
    description?: string;
}

export interface ProductCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "onClick"> {
    /**
     * 产品数据
     */
    product: ProductData;

    /**
     * 点击收藏按钮回调
     */
    onLike?: (product: ProductData) => void;
}

/**
 * ProductCard 组件
 * 用于展示作品信息的卡片组件
 */
export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
    ({ product, onLike, className = "", ...props }, ref) => {
        const workInfo = getWorkTypeInfo(product.type, true);
        const creators = product.creators || [];
        const creatorText = creators.slice(0, 3).join("/");

        const navigate = useNavigate();
        const { isLoggedIn } = useAuth();
        const openLoginModal = useLoginModalStore(state => state.openModal);

        const handleCardClick = () => {
            goToWorkDetail(navigate, product.id);
        };

        const handleShareClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!product.shareLink || !product.name) return;
            if (!isLoggedIn) {
                openLoginModal();
                return;
            }
            shareToX(product.shareLink, product.name);
        };

        const handleLikeClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            onLike?.(product);
        };

        // 保留 handleLikeClick 以便将来使用
        void handleLikeClick;

        return (
            <div
                ref={ref}
                className={`relative z-5 w-full aspect-110/160 cursor-pointer ${className}`}
                onClick={handleCardClick}
                {...props}
            >
                {/* 阴影背景 */}
                <div className="absolute z-6 bottom-0 w-full h-[85%] rounded-[10px] border border-[#c81cc569] shadow-[0_0_8px_0_rgba(228,21,153,0.33)_inset] filter-[drop-shadow(0_0.6px_1.3px_rgba(0,0,0,0.41))]" />

                {/* 产品图片 */}
                <div className="relative z-7 w-[90.91%] h-[93.75%] mx-auto">
                    <img
                        referrerPolicy="no-referrer"
                        className="w-full h-[90%] mt-[10%] rounded-[7.5px] object-cover bg-[#f5f5f5]"
                        src={resolveImageUrl(product.coverUrl)}
                        alt={product.name}
                    />
                </div>

                {/* 分享到X按钮 */}
                <div
                    className={`absolute z-8 top-[9.38%] left-[9.09%] w-[32.73%] h-[7.5%] rounded-[20px] flex justify-center items-center bg-[rgba(0,0,0,0.4)]`}
                    onClick={handleShareClick}
                >
                    <img
                        src={images.works.toX}
                        alt="X icon"
                        className="w-[23.61%] h-[66.67%] mr-[13.89%]"
                    />
                    <img
                        src={images.works.toXWhite}
                        alt="X white icon"
                        className="w-[23.61%] h-[66.67%]"
                    />
                    {product.shareCount ? (
                        <div className="absolute z-8 w-full text-center top-[85%] text-[10px] font-medium text-white [text-shadow:0_1px_1px_rgba(35,35,35,0.8)]">
                            {product.shareCount}
                        </div>
                    ) : null}
                </div>

                {/* 作品类型 */}
                <div className="absolute z-8 top-[6.25%] right-[9.09%] flex justify-center items-center">
                    <img
                        className="mr-[5px] mt-[2.5px] w-[7.5px] h-[6.5px] invert brightness-100 filter-[drop-shadow(0_1px_1px_rgba(35,35,35,0.8))]"
                        src={workInfo!.icon}
                        alt={workInfo!.text}
                    />
                    <div className="text-[8px] font-normal leading-[19px] text-white [text-shadow:0_1px_1px_rgba(35,35,35,0.8)]">
                        {workInfo!.text}
                    </div>
                </div>

                {/* 底部内容区域 */}
                <div className="absolute z-9 w-[85.45%] h-[25%] rounded-[5px] border border-[rgba(127,127,127,0.4)] bg-[linear-gradient(180deg,rgba(127,127,127,0.33)_100%,rgba(217,217,217,0.63)_20%)] backdrop-blur-[10px] bottom-[4.38%] left-0 right-0 mx-auto p-[5px] text-white [text-shadow:0_0.6px_1.3px_rgba(0,0,0,0.98)] text-[8px] font-normal text-center">
                    <div className="mb-[5px] break-all overflow-hidden text-ellipsis line-clamp-1">
                        《{product.name}》
                    </div>
                    <div className="break-all overflow-hidden text-ellipsis line-clamp-1">
                        {creatorText}
                    </div>
                </div>
            </div>
        );
    },
);

ProductCard.displayName = "ProductCard";
