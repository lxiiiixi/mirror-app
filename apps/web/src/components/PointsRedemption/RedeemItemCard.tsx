import { HTMLAttributes, forwardRef, MouseEvent } from "react";
import { resolveImageUrl } from "@mirror/utils";
import { Button } from "../../ui";
import { PointsProductItem } from "@mirror/api";

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
        const isUnavailable = data.status !== 1 || data.stock <= 0;
        const isInsufficient =
            redeemablePoints != null && Number(redeemablePoints) < Number(data.points_price);
        const actionText = isUnavailable
            ? "Unavailable"
            : isInsufficient
              ? "Insufficient Points"
              : "Redeem";
        const actionDisabled = isUnavailable || isInsufficient;

        const handleAction = (e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onAction?.();
        };

        return (
            <div
                ref={ref}
                className={`relative flex gap-4 rounded-2xl border border-white/20 bg-linear-to-br from-white/5 to-white/20 p-4 pl-[130px] h-[130px] backdrop-blur-sm ${className}`}
                {...props}
            >
                <div className="absolute left-4 bottom-4 w-[100px] h-[140px] shrink-0 overflow-hidden rounded-xl bg-white/10">
                    {data.image_url ? (
                        <img
                            src={resolveImageUrl(data.image_url)}
                            alt={data.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div
                            className="flex h-full w-full items-center justify-center text-white/30"
                            aria-hidden
                        >
                            —
                        </div>
                    )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                    <h3 className="truncate text-base font-bold text-white">{data.name}</h3>
                    <div className="mt-1 text-sm font-medium text-white/80">
                        Points {data.points_price.toLocaleString()}
                    </div>
                    <div className="mt-1 text-sm font-medium text-white/80">
                        Stock {data.stock.toLocaleString()}
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
