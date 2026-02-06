import { HTMLAttributes, forwardRef, MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../ui";

export interface MyRedemptionItemCardData {
    id: string;
    name: string;
    points: number;
    status: string;
}

export interface MyRedemptionItemCardProps extends HTMLAttributes<HTMLDivElement> {
    data: MyRedemptionItemCardData;
    actionText?: string;
    onAction?: () => void;
}

/**
 * 我的兑换记录卡片：商品名、积分、状态、SAVE 按钮
 */
export const MyRedemptionItemCard = forwardRef<HTMLDivElement, MyRedemptionItemCardProps>(
    ({ data, actionText, onAction, className = "", ...props }, ref) => {
        const { t } = useTranslation();
        const resolvedActionText = actionText ?? t("pointsRedemption.save");
        const handleAction = (e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onAction?.();
        };

        return (
            <div
                ref={ref}
                className={`flex flex-col gap-2 rounded-2xl border border-white/20 bg-linear-to-br from-white/5 to-white/20 p-4 backdrop-blur-sm ${className}`}
                {...props}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-bold text-white">{data.name}</h3>
                        <p className="mt-0.5 text-sm font-medium text-white/80">
                            {t("pointsRedemption.points", {
                                value: data.points.toLocaleString(),
                            })}
                        </p>
                        <p className="mt-1 text-xs text-white/60">{data.status}</p>
                    </div>
                    <Button variant="primary" size="small" rounded onClick={handleAction}>
                        {resolvedActionText}
                    </Button>
                </div>
            </div>
        );
    },
);

MyRedemptionItemCard.displayName = "MyRedemptionItemCard";
