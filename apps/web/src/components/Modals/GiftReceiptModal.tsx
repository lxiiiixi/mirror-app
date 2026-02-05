import { Button, Input, Modal } from "../../ui";

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
    return (
        <Modal
            open={open}
            title="Gift Receipt Information"
            onClose={onClose}
            panelClassName="max-w-[min(584px,calc(100vw-32px))]"
            bodyClassName="px-6 py-4"
            actionsClassName="px-6 pb-6 pt-2"
            actions={
                <div className="flex gap-4">
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
            }
        >
            <div className="pb-2">
                <p className="text-lg font-semibold text-white">{name}</p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0 text-base font-medium text-white/90">
                    {stock != null && <span>Stock {stock}</span>}
                    <span>Points {points.toLocaleString()}</span>
                </div>
            </div>

            <div className="pt-2">
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
        </Modal>
    );
}

GiftReceiptModal.displayName = "GiftReceiptModal";
