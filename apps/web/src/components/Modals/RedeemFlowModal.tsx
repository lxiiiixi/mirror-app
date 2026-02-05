import { Button, Input, Modal } from "../../ui";

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
    return (
        <Modal
            open={open}
            title={step === 1 ? "Confirm Redemption" : "Gift Receipt Information"}
            onClose={onClose}
            panelClassName="max-w-[min(584px,calc(100vw-32px))]"
            bodyClassName="px-6 py-4"
            actionsClassName="px-6 pb-6 pt-2"
            actions={
                <div className="flex gap-4 justify-center items-center">
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
                            <Button variant="secondary" size="medium" fullWidth onClick={onClose}>
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
                            <Button variant="secondary" size="medium" fullWidth onClick={onBack}>
                                Back
                            </Button>
                        </>
                    )}
                </div>
            }
        >
            {step === 1 ? (
                <div>
                    <p className="text-base font-semibold text-white">{productName}</p>
                    <p className="mt-1 text-sm text-white/80">
                        Points {points.toLocaleString()}
                    </p>
                </div>
            ) : (
                <div>
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
        </Modal>
    );
}

RedeemFlowModal.displayName = "RedeemFlowModal";
