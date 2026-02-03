import { useEffect } from "react";
import { X } from "lucide-react";
import { Button, Input } from "../../ui";

export interface GiftReceiptField {
    /** 表单项标签，如 "Enter Recipient Name" 或动态 "Enter **** (Dynamic Configuration)" */
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export interface GiftReceiptModalProps {
    open: boolean;
    onClose: () => void;
    /** 商品名称 */
    name: string;
    /** 所需积分 */
    points: number;
    /** 库存文案，可选 */
    stock?: string;
    /**
     * 表单项：固定 3 项（5BXAL）或动态 1 项（JIm6Z）
     * 固定示例: [{ label: "Enter Recipient Name", ... }, { label: "Enter Phone Number", ... }, { label: "Enter Shipping Address", ... }]
     * 动态示例: [{ label: "Enter **** (Dynamic Configuration)", ... }]
     */
    fields: GiftReceiptField[];
    onRedeem: () => void;
    onFillLater: () => void;
}

const modalCardClass =
    "w-full max-w-[min(584px,calc(100vw-32px))] overflow-hidden rounded-2xl border-2 border-[#727272] bg-white/20 text-white shadow-[0_4px_20px_rgba(0,0,0,0.25)] backdrop-blur-xl";
const inputClass =
    "w-full rounded-lg border border-white/20 bg-[#1b1d23] px-4 py-3 text-base text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none";

/**
 * 礼品/收货信息弹窗（设计稿 5BXAL / JIm6Z）
 * 标题 Gift Receipt Information，商品名 + Stock + 积分，动态表单项，Redeem + Fill Later
 */
export function GiftReceiptModal({
    open,
    onClose,
    name,
    points,
    stock,
    fields: controlledFields,
    onRedeem,
    onFillLater,
}: GiftReceiptModalProps) {
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
                aria-labelledby="gift-receipt-title"
            >
                <div className="relative px-6 pt-6 pb-2">
                    <h2
                        id="gift-receipt-title"
                        className="text-center text-xl font-semibold text-white"
                    >
                        Gift Receipt Information
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
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0 text-base font-medium text-white/90">
                        {stock != null && <span>Stock {stock}</span>}
                        <span>Points {points.toLocaleString()}</span>
                    </div>
                </div>

                <div className="px-6 py-4">
                    {controlledFields.map((field, index) => (
                        <div key={index} className="mb-4">
                            <label className="mb-2 block text-base font-medium text-white">
                                {field.label}
                            </label>
                            <Input
                                type="text"
                                value={field.value}
                                onChange={e => field.onChange(e.target.value)}
                                placeholder={field.placeholder}
                                className={inputClass}
                            />
                        </div>
                    ))}
                </div>

                <div className="flex gap-4 px-6 pb-6 pt-2">
                    <Button variant="primary" size="large" rounded fullWidth onClick={onRedeem}>
                        Redeem
                    </Button>
                    <Button
                        variant="secondary"
                        size="large"
                        rounded
                        fullWidth
                        className="border-2 border-transparent bg-linear-to-r from-[#ed63ce] to-[#434afb] bg-clip-padding text-white"
                        onClick={onFillLater}
                    >
                        Fill Later
                    </Button>
                </div>
            </div>
        </div>
    );
}

GiftReceiptModal.displayName = "GiftReceiptModal";
