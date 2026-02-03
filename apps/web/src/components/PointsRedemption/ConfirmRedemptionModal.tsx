import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "../../ui";

export interface ConfirmRedemptionModalProps {
    open: boolean;
    onClose: () => void;
    /** 商品名称 */
    name: string;
    /** 所需积分 */
    points: number;
    /** 是否积分不足（左侧按钮显示 Insufficient Points 并禁用） */
    insufficientPoints?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const modalCardClass =
    "w-full max-w-[min(584px,calc(100vw-32px))] overflow-hidden rounded-2xl border-2 border-[#727272] bg-white/20 text-white shadow-[0_4px_20px_rgba(0,0,0,0.25)] backdrop-blur-xl";

/**
 * 确认兑换弹窗（设计稿 lbGG1 / 8af6d）
 * 标题 Confirm Redemption，商品名 + 积分，Redeem / Insufficient Points + Cancel
 */
export function ConfirmRedemptionModal({
    open,
    onClose,
    name,
    points,
    insufficientPoints = false,
    onConfirm,
    onCancel,
}: ConfirmRedemptionModalProps) {
    useEffect(() => {
        if (!open || !onClose) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={onClose}
            role="presentation"
        >
            <div
                className={modalCardClass}
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-redemption-title"
            >
                <div className="relative px-6 pt-6 pb-2">
                    <h2
                        id="confirm-redemption-title"
                        className="text-center text-xl font-semibold text-white"
                    >
                        Confirm Redemption
                    </h2>
                    <button
                        type="button"
                        className="absolute right-4 top-6 flex h-6 w-6 items-center justify-center text-white/80 transition hover:text-white"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="px-6 py-2">
                    <p className="text-lg font-semibold text-white">{name}</p>
                    <p className="mt-1 text-base font-medium text-white/90">
                        Points {points.toLocaleString()}
                    </p>
                </div>

                <div className="flex gap-4 px-6 pb-6 pt-4">
                    <Button
                        variant={insufficientPoints ? "secondary" : "primary"}
                        size="large"
                        rounded
                        fullWidth
                        disabled={insufficientPoints}
                        className={
                            insufficientPoints
                                ? "cursor-not-allowed bg-[#9e9e9e] text-black hover:bg-[#9e9e9e]"
                                : ""
                        }
                        onClick={onConfirm}
                    >
                        {insufficientPoints ? "Insufficient Points" : "Redeem"}
                    </Button>
                    <Button
                        variant="secondary"
                        size="large"
                        rounded
                        fullWidth
                        className="border-2 border-transparent bg-linear-to-r from-[#ed63ce] to-[#434afb] bg-clip-padding text-white"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
}

ConfirmRedemptionModal.displayName = "ConfirmRedemptionModal";
