import { HTMLAttributes, forwardRef, MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../ui";
import { PointsProductItem } from "@mirror/api";
import { ImageWrapper } from "../Common/ImageWrapper";
import { createNoiseDataUrl, Noise } from "../../ui/Noise/Noise";

export interface RedeemItemCardProps extends HTMLAttributes<HTMLDivElement> {
    data: PointsProductItem;
    redeemablePoints: number | null;
    onAction?: () => void;
}

/**
 * 积分商城商品卡片：左侧图片，右侧标题 + 积分 + 兑换按钮
 */
export const RedeemItemCard = forwardRef<HTMLDivElement, RedeemItemCardProps>(
    ({ data, redeemablePoints, onAction, className = "", ...props }, ref) => {
        const { t } = useTranslation();
        const isUnavailable = data.status !== 1 || data.stock <= 0;
        const isInsufficient =
            redeemablePoints != null && Number(redeemablePoints) < Number(data.points_price);
        const actionText = isUnavailable
            ? t("redeemItemCard.unavailable")
            : isInsufficient
              ? t("redeemItemCard.insufficientPoints")
              : t("redeemItemCard.redeem");
        const actionDisabled = isUnavailable || isInsufficient;

        const handleAction = (e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onAction?.();
        };

        const noiseUrl = createNoiseDataUrl({ baseFrequency: 0.65, numOctaves: 3, opacity: 0.35 });

        return (
            <div
                ref={ref}
                className={`relative flex gap-4 rounded-2xl border border-white/20 p-2 pl-[130px] h-[100px] backdrop-blur-[100px] ${className}`}
                style={{
                    backgroundImage: `linear-gradient(to right bottom, var(--color-bg), rgba(0,0,0,0)), url("${noiseUrl}")`,
                }}
                {...props}
            >
                <div className="absolute left-3 bottom-3 w-[90px] h-[110px] shrink-0">
                    <ImageWrapper
                        // src={data.image_url ?? ""}
                        src={"https://testimage.mirror.fan/upload/lgn/lgn_poster1.jpeg"}
                        alt={data.name}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                    <h3 className="truncate text-base font-bold text-white">{data.name}</h3>
                    <div className="mt-1 text-sm font-medium text-white/80">
                        {t("redeemItemCard.points", {
                            value: data.points_price.toLocaleString(),
                        })}
                    </div>
                    <div className="mt-1 text-sm font-medium text-white/80">
                        {t("redeemItemCard.stock", { value: data.stock.toLocaleString() })}
                    </div>
                    <div className="absolute right-3 bottom-3">
                        <Button
                            variant="primary"
                            size="small"
                            disabled={actionDisabled}
                            onClick={handleAction}
                        >
                            {actionText}
                        </Button>
                    </div>
                </div>
            </div>
        );
    },
);

RedeemItemCard.displayName = "RedeemItemCard";
