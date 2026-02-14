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
                <div className="title text-[16px]">{t("promotion.promotion")}</div>
                <div>
                    <div className="text-[12px]">
                        {t("promotion.directCommission")} {inviteNum.direct_invites}
                    </div>
                    <div className="text-[12px]">
                        {t("promotion.indirectCommission")} {inviteNum.indirect_invites}
                    </div>
                </div>
            </div>

            <div className="share-box">
                <div className="promotion-left">
                    <div className="relative flex h-[110px] w-[180px] flex-col items-center justify-center gap-2 overflow-hidden rounded-xl">
                        {/* 背景图：铺满容器，可能裁剪 */}
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                            style={{ backgroundImage: `url(${images.images.qrcodeBg})` }}
                        />
                        {/* 黑色半透明遮罩 */}
                        <div className="absolute inset-0 bg-black/80" />
                        {/* 内容层 */}
                        <div className="relative z-10 flex flex-col items-center justify-center gap-2">
                            <img className="w-20" src={images.vip.shareLogo} alt="" />
                            <QrcodeCanvas value={inviteUrl} size={56} />
                        </div>
                    </div>
                </div>
                <div className="promotion-right">
                    <div className="btn-row">
                        <button type="button" className="save-btn text-[14px]" onClick={savePoster}>
                            {savingPoster
                                ? t("miningShare.generating")
                                : t("miningShare.savePoster")}
                        </button>
                        <button type="button" className="share-btn text-[14px]" onClick={copyLink}>
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
                <div className="stats-label text-[14px]">{t("promotion.todaysCommission")}</div>
                <div className="stats-value text-[26px]">{formatNumber(today)}</div>
            </div>
            <div className="stats-col">
                <div className="stats-label text-[14px]">{t("promotion.cumulativeCommission")}</div>
                <div className="stats-value text-[26px]">${formatNumber(total)}</div>
            </div>
        </div>
    );
};
