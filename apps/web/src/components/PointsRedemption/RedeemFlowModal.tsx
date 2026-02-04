import { useEffect } from "react";
import { X } from "lucide-react";
import { Button, Input } from "../../ui";
import { resolveImageUrl } from "@mirror/utils";

export interface RedeemFlowField {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export interface RedeemFlowModalProps {
    open: boolean;
    step: 1 | 2;
    productName: string;
    points: number;
    stock?: number;
    insufficientPoints?: boolean;
    fields: RedeemFlowField[];
    isSubmitting?: boolean;
    onConfirmStep1: () => void;
    onConfirmStep2: () => void;
    onBack: () => void;
    onClose: () => void;
}

const modalCardClass =
    "w-full max-w-[min(584px,calc(100vw-32px))] overflow-hidden rounded-2xl border-2 border-[#727272] bg-white/20 text-white shadow-[0_4px_20px_rgba(0,0,0,0.25)] backdrop-blur-xl";
const inputClass =
    "w-full rounded-lg border border-white/20 bg-[#1b1d23] px-4 py-3 text-base text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none";

export function RedeemFlowModal({
    open,
    step,
    productName,
    points,
    stock,
    insufficientPoints = false,
    fields,
    isSubmitting = false,
    onConfirmStep1,
    onConfirmStep2,
    onBack,
    onClose,
}: RedeemFlowModalProps) {
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
                aria-labelledby="redeem-flow-title"
            >
                <div className="relative px-6 pt-6 pb-2">
                    <h2
                        id="redeem-flow-title"
                        className="text-center text-xl font-semibold text-white"
                    >
                        {step === 1 ? "Confirm Redemption" : "Gift Receipt Information"}
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

                {step === 1 ? (
                    <div className="px-6 py-4">
                        <div>
                            <p className="text-base font-semibold text-white">{productName}</p>
                            <p className="mt-1 text-sm text-white/80">
                                Points {points.toLocaleString()}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="px-6 py-4">
                        <p className="text-lg font-semibold text-white">{productName}</p>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0 text-base font-medium text-white/90">
                            {stock != null ? <span>Stock {stock}</span> : null}
                            <span>Points {points.toLocaleString()}</span>
                        </div>
                        <div className="mt-4">
                            {fields.map((field, index) => (
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
                    </div>
                )}

                <div className="flex gap-4 px-6 pb-6 pt-2 justify-center items-center">
                    {step === 1 ? (
                        <>
                            <Button
                                variant={insufficientPoints ? "secondary" : "primary"}
                                size="medium"
                                fullWidth
                                disabled={insufficientPoints || isSubmitting}
                                className={
                                    insufficientPoints
                                        ? "cursor-not-allowed bg-[#9e9e9e] text-black hover:bg-[#9e9e9e]"
                                        : ""
                                }
                                onClick={onConfirmStep1}
                            >
                                {insufficientPoints ? "Insufficient Points" : "Confirm"}
                            </Button>
                            <Button
                                variant="secondary"
                                size="medium"
                                // className="border-2 border-transparent bg-linear-to-r from-[#ed63ce] to-[#434afb] bg-clip-padding text-white"
                                fullWidth
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="primary"
                                size="medium"
                                fullWidth
                                disabled={isSubmitting}
                                onClick={onConfirmStep2}
                            >
                                {isSubmitting ? "Submitting..." : "Redeem"}
                            </Button>
                            <Button
                                variant="secondary"
                                size="medium"
                                fullWidth
                                // className="border-2 border-transparent bg-linear-to-r from-[#ed63ce] to-[#434afb] bg-clip-padding text-white"
                                onClick={onBack}
                            >
                                Back
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

RedeemFlowModal.displayName = "RedeemFlowModal";
