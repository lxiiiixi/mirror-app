import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "../../ui";

export interface PaySuccDialogProps {
    open: boolean;
    onClose: () => void;
    onJump?: () => void;
}

export function PaySuccDialog({ open, onClose, onJump }: PaySuccDialogProps) {
    const { t } = useTranslation();
    const label = t("paySuccDialog.myRecords");
    const message = t("paySuccDialog.paymentSuccess", { myRecords: "__MY_RECORDS__" });
    const [before, after = ""] = useMemo(() => message.split("__MY_RECORDS__"), [message]);

    return (
        <Modal open={open} title={t("paySuccDialog.title")} onClose={onClose}>
            <div className="pay-succ text-[14px]">
                <span>{before}</span>
                <button type="button" className="link-btn" onClick={onJump}>
                    {label}
                </button>
                <span>{after}</span>
            </div>

            <style jsx>{`
                .pay-succ {
                    line-height: 1.6;
                    text-align: center;
                    color: #fff;
                }

                .link-btn {
                    color: #ff1a90;
                    text-decoration: underline;
                    background: none;
                    border: none;
                    padding: 0;
                    margin: 0 4px;
                    cursor: pointer;
                }
            `}</style>
        </Modal>
    );
}
