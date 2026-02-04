import { HTMLAttributes, forwardRef, MouseEvent } from "react";
import { resolveImageUrl } from "@mirror/utils";
import { Button } from "../../ui";

export interface RedeemItemCardData {
    id: string;
    name: string;
    coverUrl: string;
    points: number;
}

export interface RedeemItemCardProps extends HTMLAttributes<HTMLDivElement> {
    data: RedeemItemCardData;
    actionText?: string;
    actionDisabled?: boolean;
    onAction?: () => void;
}

/**
 * 积分商城商品卡片：左侧图片，右侧标题 + 积分 + 兑换按钮
 */
export const RedeemItemCard = forwardRef<HTMLDivElement, RedeemItemCardProps>(
    (
        { data, actionText = "Redeem", actionDisabled = false, onAction, className = "", ...props },
        ref,
    ) => {
        const handleAction = (e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onAction?.();
        };

        return (
            <div
                ref={ref}
                className={`flex gap-4 rounded-2xl border border-white/20 bg-linear-to-br from-white/5 to-white/20 p-4 backdrop-blur-sm ${className}`}
                {...props}
            >
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-white/10">
                    {data.coverUrl ? (
                        <img
                            src={resolveImageUrl(data.coverUrl)}
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
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <h3 className="truncate text-base font-bold text-white">{data.name}</h3>
                    <div className="mt-1 text-sm font-medium text-white/80">
                        {data.points.toLocaleString()} Points
                    </div>
                    <div className="mt-2">
                        <Button
                            variant="primary"
                            size="small"
                            rounded
                            className="min-w-[80px]"
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
