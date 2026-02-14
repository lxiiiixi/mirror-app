import { HTMLAttributes, forwardRef, MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button, StampImageBox } from "../../ui";
import { PointsProductItem } from "@mirror/api";
import { createNoiseDataUrl } from "../../ui/Noise/Noise";

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
        const actionText = isUnavailable
            ? t("redeemItemCard.unavailable")
            : t("redeemItemCard.redeem");
        const actionDisabled = isUnavailable;

        const handleAction = (e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onAction?.();
        };

        const noiseUrl = createNoiseDataUrl({ baseFrequency: 0.65, numOctaves: 3, opacity: 0.35 });

        return (
            <div
                ref={ref}
                className={`relative flex gap-4 rounded-2xl border border-white/20 p-3 pl-[115px] h-[110px] backdrop-blur-[100px] ${className}`}
                style={{
                    backgroundImage: `linear-gradient(to right bottom, var(--color-bg), rgba(0,0,0,0)), url("${noiseUrl}")`,
                }}
                {...props}
            >
                <div className="absolute left-4 bottom-4 shrink-0">
                    <StampImageBox
                        src="https://testimage.mirror.fan/upload/lgn/lgn_poster1.jpeg"
                        // src={data.image_url ?? ""}
                        alt={""}
                        width={85}
                        height={119} // ratio 1.4
                    />
                </div>

                <div className="flex min-w-0 flex-1 flex-col items-start justify-between">
                    <h3 className="truncate text-base font-bold text-white">{data.name}</h3>
                    <div>
                        <div className="mt-1 text-sm font-medium text-white/80">
                            {t("redeemItemCard.points", {
                                value: data.points_price.toLocaleString(),
                            })}
                        </div>

                        <div className="mt-1 text-sm font-medium text-white/80">
                            {t("redeemItemCard.stock", { value: data.stock.toLocaleString() })}
                        </div>
                    </div>

                    <div className="absolute right-4 bottom-4">
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
