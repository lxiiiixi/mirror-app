import { images } from "@mirror/assets";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { QrcodeCanvas } from "./QrcodeCanvas";
import { useAlertStore } from "../../store/useAlertStore";
import QRCode from "qrcode";
import { formatNumber } from "@mirror/utils";

const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("load image failed"));
        img.src = src;
    });

export const CommunityCard = ({
    inviteUrl,
    inviteNum,
}: {
    inviteUrl: string;
    inviteNum: { direct_invites: string; indirect_invites: string };
}) => {
    const { t } = useTranslation();
    const showAlert = useAlertStore(state => state.show);

    const [savingPoster, setSavingPoster] = useState(false);

    const copyLink = useCallback(async () => {
        if (!inviteUrl) return;
        try {
            await navigator.clipboard.writeText(inviteUrl);
            showAlert({ message: t("miningShare.copiedSuccess"), variant: "success" });
        } catch (error) {
            console.error("[Promotion] copy failed", error);
            showAlert({ message: t("account.copyFailed"), variant: "error" });
        }
    }, [inviteUrl, showAlert, t]);

    const savePoster = useCallback(async () => {
        if (!inviteUrl || savingPoster) return;
        setSavingPoster(true);
        try {
            const qrDataUrl = await QRCode.toDataURL(inviteUrl, {
                width: 260,
                margin: 0,
                color: {
                    dark: "#ffffff",
                    light: "rgba(0,0,0,0)",
                },
            });
            const [logoImage, qrImage] = await Promise.all([
                loadImage(images.vip.shareLogo),
                loadImage(qrDataUrl),
            ]);

            const canvas = document.createElement("canvas");
            canvas.width = 900;
            canvas.height = 430;
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("no canvas context");

            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const logoWidth = 260;
            const logoHeight = 70;
            ctx.drawImage(logoImage, (canvas.width - logoWidth) / 2, 40, logoWidth, logoHeight);

            const qrSize = 240;
            ctx.drawImage(qrImage, (canvas.width - qrSize) / 2, 140, qrSize, qrSize);

            const downloadUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = "promotion.png";
            link.click();
        } catch (error) {
            console.error("[Promotion] save poster failed", error);
            showAlert({ message: t("miningShare.saveFailed"), variant: "error" });
        } finally {
            setSavingPoster(false);
        }
    }, [inviteUrl, savingPoster, showAlert, t]);

    return (
        <div className="content-card promotion-card">
            <div className="card-title">
                <div className="title text-[14px]">{t("promotion.promotion")}</div>
                <div>
                    <div className="commission-line text-[12px]">
                        {t("promotion.directCommission")} {inviteNum.direct_invites}
                    </div>
                    <div className="commission-line text-[12px]">
                        {t("promotion.indirectCommission")} {inviteNum.indirect_invites}
                    </div>
                </div>
            </div>

            <div className="share-box">
                <div className="promotion-left">
                    <div className="qrcode-box">
                        <img className="share-logo" src={images.vip.shareLogo} alt="" />
                        <QrcodeCanvas value={inviteUrl} size={56} />
                    </div>
                </div>
                <div className="promotion-right">
                    <div className="btn-row">
                        <button type="button" className="save-btn text-[12px]" onClick={savePoster}>
                            {savingPoster
                                ? t("miningShare.generating")
                                : t("miningShare.savePoster")}
                        </button>
                        <button type="button" className="share-btn text-[12px]" onClick={copyLink}>
                            {t("miningShare.shareLink")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CommissionCard = ({ today, total }: { today: string; total: string }) => {
    const { t } = useTranslation();
    return (
        <div className="content-card stats-card">
            <div className="stats-col">
                <div className="stats-label text-[12px]">{t("promotion.todaysCommission")}</div>
                <div className="stats-value text-[24px]">{formatNumber(today)}</div>
            </div>
            <div className="stats-col">
                <div className="stats-label text-[12px]">{t("promotion.cumulativeCommission")}</div>
                <div className="stats-value text-[24px]">${formatNumber(total)}</div>
            </div>
        </div>
    );
};
