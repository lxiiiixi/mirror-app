import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import QRCode from "qrcode";
import { artsApiClient } from "../api/artsClient";
import { images } from "@mirror/assets";
import { useAlertStore } from "../store/useAlertStore";
import { useAuth } from "../hooks/useAuth";
import { useLoginModalStore } from "../store/useLoginModalStore";
import { QrcodeCanvas } from "../components/Promotion/QrcodeCanvas";
import { isTokenWork } from "../utils/work";
import { WorkSummary } from "@mirror/api";

interface InviteInfo {
    invite_code: string;
    invite_num: number;
    second_level_invites: number;
}

const formatNumber = (value: string | number) => {
    const numeric = Number(value ?? 0);
    if (!Number.isFinite(numeric)) return String(value ?? 0);
    return numeric.toLocaleString();
};

const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("load image failed"));
        img.src = src;
    });

function Promotion() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const { isLoggedIn } = useAuth();
    const showAlert = useAlertStore(state => state.show);

    const [inviteUrl, setInviteUrl] = useState("");
    const [today, setToday] = useState("0");
    const [total, setTotal] = useState("0");
    const [inviteCode, setInviteCode] = useState("");
    const [userCanBuy, setUserCanBuy] = useState(false);
    const [isCanBind, setIsCanBind] = useState(false);
    const [inviteNum, setInviteNum] = useState({ direct_invites: "0/0", indirect_invites: "0/0" });
    const [savingPoster, setSavingPoster] = useState(false);

    const inviteBase = useMemo(() => {
        if (typeof window === "undefined") return "";
        return `${window.location.origin}/?club_invite=`;
    }, []);

    const getInviteData = useCallback(() => {
        const code = searchParams.get("club_invite") || localStorage.getItem("club_invite") || "";
        if (code) {
            localStorage.setItem("club_invite", code);
        }
        setInviteCode(code);
    }, [searchParams]);

    const getInviteInfo = useCallback(async () => {
        try {
            const response = await artsApiClient.node.getInviteInfo();
            const data = response.data;
            const inviteCodeValue = String(data?.invite_code ?? "");
            setToday(String(data?.total_invites ?? 0));
            setTotal(String(data?.total_rewards ?? 0));
            setInviteUrl(`${inviteBase}${inviteCodeValue}`);
        } catch (error) {
            console.error("[Promotion] invite info failed", error);
        }
    }, [inviteBase]);

    const getInviteNumbers = useCallback(async () => {
        try {
            const response = await artsApiClient.requestJson<Record<string, unknown>>(
                "GET",
                "/arts/user/levelProgress",
                { auth: "required" },
            );
            const data = response.data as Record<string, unknown>;
            const currentLevel = Number(data?.current_level ?? data?.currentLevel ?? 0) || 0;
            const direct =
                (data?.direct_invites as string) ||
                (data?.directInvites as string) ||
                (currentLevel
                    ? (data as Record<string, unknown>)[`v${currentLevel}_direct_count`]
                    : undefined) ||
                "0/0";
            const indirect =
                (data?.indirect_invites as string) ||
                (data?.indirectInvites as string) ||
                (currentLevel
                    ? (data as Record<string, unknown>)[`v${currentLevel}_indirect_count`]
                    : undefined) ||
                "0/0";
            setInviteNum({
                direct_invites: String(direct),
                indirect_invites: String(indirect),
            });
        } catch (error) {
            console.error("[Promotion] level progress failed", error);
        }
    }, []);

    const getUserCheck = useCallback(async () => {
        if (!isLoggedIn) return;
        try {
            const response = await artsApiClient.requestJson<Record<string, unknown>>(
                "GET",
                "/arts/user/check",
                { auth: "required" },
            );
            const data = response.data as Record<string, unknown>;
            const canBuy = Boolean(data?.is_wallet_while ?? data?.in_whitelist ?? true);
            setUserCanBuy(canBuy);
            setIsCanBind(Boolean(data?.is_invite === false));
            if (canBuy) {
                await Promise.all([getInviteInfo(), getInviteNumbers()]);
            }
        } catch (error) {
            console.error("[Promotion] user check failed", error);
        }
    }, [getInviteInfo, getInviteNumbers, isLoggedIn]);

    const bindUser = useCallback(async () => {
        if (!inviteCode) return;
        try {
            await artsApiClient.requestJson("POST", "/arts/user/bind", {
                auth: "required",
                body: { code: inviteCode },
            });
            showAlert({ message: t("promotion.bindSu"), variant: "success" });
            setIsCanBind(false);
            void getUserCheck();
        } catch (error) {
            console.error("[Promotion] bind failed", error);
            showAlert({ message: t("assets.loadFailed"), variant: "error" });
        }
    }, [getUserCheck, inviteCode, showAlert, t]);

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

    useEffect(() => {
        getInviteData();
    }, [getInviteData]);

    useEffect(() => {
        void getUserCheck();
    }, [getUserCheck]);

    return (
        <div className="promotion-page">
            {isCanBind && inviteCode ? (
                <button className="header-title-btn" type="button" onClick={bindUser}>
                    {t("promotion.bindSuperior")}
                </button>
            ) : null}

            <div className="sub-title">{t("promotion.subTitle")}</div>

            {userCanBuy ? (
                <div className="content-card promotion-card">
                    <div className="card-title">
                        <div className="title">{t("promotion.promotion")}</div>
                        <div>
                            <div className="commission-line">
                                {t("promotion.directCommission")} {inviteNum.direct_invites}
                            </div>
                            <div className="commission-line">
                                {t("promotion.indirectCommission")} {inviteNum.indirect_invites}
                            </div>
                        </div>
                    </div>

                    <div className="share-box">
                        <div className="promotion-left">
                            <div className="qrcode-box">
                                <img className="share-logo" src={images.vip.shareLogo} alt="" />
                                <QrcodeCanvas value={inviteUrl} size={86} />
                            </div>
                        </div>
                        <div className="promotion-right">
                            <div className="btn-row">
                                <button type="button" className="save-btn" onClick={savePoster}>
                                    {savingPoster
                                        ? t("miningShare.generating")
                                        : t("miningShare.savePoster")}
                                </button>
                                <button type="button" className="share-btn" onClick={copyLink}>
                                    {t("miningShare.shareLink")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            <div className="content-card stats-card">
                <div className="stats-col">
                    <div className="stats-label">{t("promotion.todaysCommission")}</div>
                    <div className="stats-value">{formatNumber(today)}</div>
                </div>
                <div className="stats-col">
                    <div className="stats-label">{t("promotion.cumulativeCommission")}</div>
                    <div className="stats-value">${formatNumber(total)}</div>
                </div>
            </div>

            <div className="tip-text">{t("promotion.tipText")}</div>

            <style jsx>{`
                .promotion-page {
                    padding: 16px;
                    font-family: Rubik, sans-serif;
                    color: #ffffff;
                    font-size: 12px;
                }

                .header-title-btn {
                    width: 100%;
                    height: 44px;
                    background: var(--gradient-primary);
                    border-radius: 10px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 16px;
                    font-weight: 700;
                    margin-bottom: 16px;
                    border: none;
                    color: #fff;
                }

                .sub-title {
                    font-size: 18px;
                    font-weight: 600;
                    text-align: center;
                    margin-bottom: 16px;
                    background: linear-gradient(90deg, #9afff2 0%, #e7cbfb 50.96%, #7b69ff 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .content-card {
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 16px;
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.18);
                    backdrop-filter: blur(40px);
                }

                .promotion-card .card-title {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .promotion-card .title {
                    font-size: 14px;
                    font-weight: 700;
                }

                .commission-line {
                    font-size: 12px;
                }

                .share-box {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-top: 12px;
                    gap: 16px;
                }

                .qrcode-box {
                    width: 180px;
                    height: 110px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    background: #000000db;
                    border-radius: 12px;
                    gap: 8px;
                }

                .share-logo {
                    width: 90px;
                    height: 26px;
                }

                .promotion-right {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                }

                .btn-row {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .save-btn,
                .share-btn {
                    width: 120px;
                    height: 34px;
                    border-radius: 8px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 12px;
                    font-weight: 600;
                    background: #eb1484;
                    color: #fff;
                    border: none;
                    cursor: pointer;
                }

                .stats-card {
                    display: flex;
                    gap: 12px;
                }

                .stats-col {
                    flex: 1;
                }

                .stats-label {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.8);
                    margin-bottom: 6px;
                }

                .stats-value {
                    font-size: 24px;
                    font-weight: 700;
                    color: #ff9d00;
                }

                .tip-text {
                    font-size: 14px;
                    line-height: 1.5;
                    text-align: center;
                    color: rgba(255, 255, 255, 1);
                    margin-bottom: 24px;
                }

                .empty-tip {
                    text-align: center;
                    padding: 20px 0;
                    color: #999;
                }
            `}</style>
        </div>
    );
}

export default Promotion;
