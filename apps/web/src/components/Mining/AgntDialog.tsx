import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "../../ui";

export interface AgntDialogProps {
    open: boolean;
    onClose: () => void;
}

const splitLines = (text: string) =>
    text
        .replace(/<br\s*\/>/gi, "\n")
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);

export function AgntDialog({ open, onClose }: AgntDialogProps) {
    const { t } = useTranslation();
    const rows = useMemo(
        () => [t("agntDialog.v1"), t("agntDialog.v2"), t("agntDialog.v3"), t("agntDialog.v4"), t("agntDialog.v5")],
        [t],
    );

    return (
        <Modal open={open} title={t("agntDialog.title")} onClose={onClose}>
            <div className="agnt-dialog">
                <h4 className="agnt-title text-[16px]">{t("agntDialog.joinVip")}</h4>
                <p className="agnt-desc text-[13px]">{t("agntDialog.joinVipDesc")}</p>
                <p className="agnt-gift text-[12px]" dangerouslySetInnerHTML={{
                    __html: t("agntDialog.giftNodeDesc"),
                }} />

                <div className="agnt-list">
                    {rows.map((item, index) => (
                        <div className="agnt-item" key={`${index}-${item}`}>
                            {splitLines(item).map((line, lineIndex) => (
                                <div key={`${index}-${lineIndex}`} className="agnt-line text-[12px]">
                                    {line}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .agnt-dialog {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    color: #fff;
                    text-align: center;
                }

                .agnt-title {
                    font-weight: 700;
                    margin: 0;
                }

                .agnt-desc {
                    line-height: 1.6;
                    color: rgba(238, 238, 238, 1);
                    margin: 0;
                }

                .agnt-gift {
                    line-height: 1.6;
                    color: rgba(224, 224, 224, 0.9);
                    margin: 0;
                }

                .agnt-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    text-align: left;
                }

                .agnt-item {
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 10px;
                    padding: 10px 12px;
                }

                .agnt-line {
                    line-height: 1.5;
                }
            `}</style>
        </Modal>
    );
}
