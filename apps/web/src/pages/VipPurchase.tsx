import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { artsApiClient } from "../api/artsClient";
import { images } from "@mirror/assets";
import { Spinner } from "../ui";
import { useAuth } from "../hooks/useAuth";
import { useLoginModalStore } from "../store/useLoginModalStore";
import { useAlertStore } from "../store/useAlertStore";
import { useLegalRestrictionStore } from "../store/useLegalRestrictionStore";
import { AgntDialog } from "../components/Mining/AgntDialog";
import { PaySuccDialog } from "../components/Mining/PaySuccDialog";

interface TierInfo {
    totalNum: number;
    remainingInTier: number;
    totalInTier: number;
    nowPrice: number;
}

interface NodeInfoState {
    price: number;
    node_total_num: number;
    power: number;
    node_remain_num: number;
    ent_issue_num: number;
    ent_release_num: number;
}

const fullGiftRules = [
    { min: 20, gift: 2 },
    { min: 30, gift: 4 },
    { min: 40, gift: 5 },
    { min: 50, gift: 7 },
    { min: 100, gift: 15 },
];

const formatNumber = (value?: number | string) => {
    if (value === undefined || value === null) return "0";
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return String(value);
    return numeric.toLocaleString();
};

function VipPurchase() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isLoggedIn, isEmailLogin } = useAuth();
    const openLoginModal = useLoginModalStore(state => state.openModal);
    const showAlert = useAlertStore(state => state.show);
    const showLegalRestriction = useLegalRestrictionStore(state => state.show);

    const [tierInfo, setTierInfo] = useState<TierInfo>({
        totalNum: 0,
        remainingInTier: 0,
        totalInTier: 0,
        nowPrice: 0,
    });
    const [nodeInfo, setNodeInfo] = useState<NodeInfoState>({
        price: 0,
        node_total_num: 0,
        power: 0,
        node_remain_num: 0,
        ent_issue_num: 0,
        ent_release_num: 0,
    });

    const [quantity, setQuantity] = useState(10);
    const [waitPay, setWaitPay] = useState(false);
    const [loadingText, setLoadingText] = useState(t("miningIndex.waitingForPayment"));
    const [showLoadingText2, setShowLoadingText2] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPaySuccDialog, setShowPaySuccDialog] = useState(false);
    const [showAgntDialog, setShowAgntDialog] = useState(false);
    const [userCanBuy, setUserCanBuy] = useState(true);
    const pollTimerRef = useRef<number | null>(null);

    const currentGiftNodes = useMemo(() => {
        const qty = quantity;
        for (let i = fullGiftRules.length - 1; i >= 0; i -= 1) {
            if (qty >= fullGiftRules[i].min) {
                return fullGiftRules[i].gift;
            }
        }
        return 0;
    }, [quantity]);

    const totalPrice = useMemo(() => {
        const total = quantity * tierInfo.nowPrice;
        if (Number.isNaN(total)) return 0;
        return Number.parseFloat(total.toFixed(6));
    }, [quantity, tierInfo.nowPrice]);

    const dailyOutput = useMemo(() => {
        if (nodeInfo.ent_issue_num && nodeInfo.node_total_num) {
            return Math.floor(nodeInfo.ent_release_num / 360 / nodeInfo.node_total_num);
        }
        return 0;
    }, [nodeInfo]);

    const loadTierInfo = useCallback(async () => {
        try {
            const response = await artsApiClient.node.getCurrentTierInfo({ id: 1 });
            const data = response.data;
            setTierInfo({
                totalNum: Number(data?.total_quantity ?? 0),
                remainingInTier: Number(data?.remaining_quantity ?? 0),
                totalInTier: Number(data?.total_quantity ?? 0),
                nowPrice: Number(data?.tier_price ?? 0),
            });
        } catch (error) {
            console.error("[VipPurchase] tier info failed", error);
        }
    }, []);

    const loadNodeInfo = useCallback(async () => {
        try {
            const response = await artsApiClient.node.getNodeInfo({ id: 1 });
            const data = response.data;
            // TODO 整合数据
            setNodeInfo({
                price: 0,
                node_total_num: 0,
                power: 0,
                node_remain_num: 0,
                ent_issue_num: 0,
                ent_release_num: 0,
            });
        } catch (error) {
            console.error("[VipPurchase] node info failed", error);
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
            setUserCanBuy(Boolean(data?.is_wallet_while ?? data?.in_whitelist ?? true));
        } catch (error) {
            console.error("[VipPurchase] user check failed", error);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        const code = searchParams.get("club_invite") || localStorage.getItem("club_invite") || "";
        if (code) {
            localStorage.setItem("club_invite", code);
        }
    }, [searchParams]);

    useEffect(() => {
        void loadTierInfo();
        void loadNodeInfo();
        void getUserCheck();
    }, [getUserCheck, loadNodeInfo, loadTierInfo]);

    useEffect(() => {
        if (tierInfo.remainingInTier > 0 && quantity > tierInfo.remainingInTier) {
            setQuantity(tierInfo.remainingInTier);
        }
        if (quantity < 1) {
            setQuantity(1);
        }
    }, [quantity, tierInfo.remainingInTier]);

    const increaseQuantity = () => {
        if (quantity < tierInfo.remainingInTier) {
            setQuantity(prev => prev + 1);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const selectVip = (num: number) => {
        const next = num * 10;
        if (next > tierInfo.remainingInTier) {
            setQuantity(tierInfo.remainingInTier);
        } else {
            setQuantity(next);
        }
    };

    const stopPolling = () => {
        if (pollTimerRef.current) {
            window.clearTimeout(pollTimerRef.current);
            pollTimerRef.current = null;
        }
    };

    const searchTxStatus = useCallback(async (signature: string) => {
        try {
            const response = await artsApiClient.node.getTxInfo({ signature });
            const status = response.data?.status ?? "pending";
            if (status === "success") {
                setShowPaySuccDialog(true);
                setWaitPay(false);
                setShowLoadingText2(false);
                stopPolling();
                return;
            }

            if (status === "failed") {
                setShowLoadingText2(true);
                return;
            }

            pollTimerRef.current = window.setTimeout(() => {
                void searchTxStatus(signature);
            }, 2000);
        } catch (error) {
            console.error("[VipPurchase] tx status failed", error);
            setShowLoadingText2(true);
        }
    }, []);

    const buyNode = useCallback(async () => {
        if (isSubmitting) return;
        if (!isEmailLogin) {
            showLegalRestriction();
            return;
        }

        setIsSubmitting(true);
        setWaitPay(true);
        setLoadingText(t("miningIndex.waitingForPayment"));
        setShowLoadingText2(false);

        try {
            const quote = await artsApiClient.node.getQuote({ node_id: 1, quantity });
            const paymentMethod = String(quote.data?.currency ?? "usdt");
            const purchase = await artsApiClient.node.purchase({
                node_id: 1,
                quantity,
                payment_method: paymentMethod,
            });
            const signature = purchase.data?.tx_signature ?? "";
            if (signature) {
                setLoadingText(t("miningIndex.queryTxResult"));
                void searchTxStatus(signature);
            } else {
                setWaitPay(false);
            }
        } catch (error) {
            console.error("[VipPurchase] buy failed", error);
            showAlert({ message: t("miningIndex.orderCreateFailed"), variant: "error" });
            setWaitPay(false);
        } finally {
            setIsSubmitting(false);
        }
    }, [isSubmitting, isEmailLogin, quantity, searchTxStatus, showAlert, showLegalRestriction, t]);

    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, []);

    if (!isLoggedIn) {
        return (
            <div className="vip-purchase-page">
                <div className="login-content">
                    <div className="login-title">{t("account.login")}</div>
                    <button type="button" className="login-button" onClick={openLoginModal}>
                        <img className="wallet-icon" src={images.account.phantomIcon} alt="" />
                        <span className="wallet-name">Wallet / Email</span>
                    </button>
                </div>
                <style jsx>{`
                    .vip-purchase-page {
                        min-height: 100vh;
                        padding: 20px;
                    }

                    .login-content {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        padding-top: 60px;
                        gap: 28px;
                    }

                    .login-title {
                        font-size: 28px;
                        font-weight: 700;
                        background: linear-gradient(90deg, #00f2ff 0%, #5773ff 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }

                    .login-button {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 12px;
                        width: min(320px, 100%);
                        height: 64px;
                        border-radius: 999px;
                        background: rgba(153, 153, 153, 0.06);
                        border: 1px solid rgba(255, 255, 255, 0.12);
                        color: #fff;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        backdrop-filter: blur(20px);
                    }

                    .wallet-icon {
                        width: 26px;
                        height: 26px;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="vip-purchase-page">
            <div className="body-content">
                <div className="header">
                    <div className="header-image-wrapper">
                        <img
                            className="header-image"
                            src={images.account.channel}
                            alt=""
                            onClick={() => setShowAgntDialog(true)}
                        />
                        <div className="image-icon">
                            <img src={images.account.ent} alt="" />
                        </div>
                    </div>
                    <div className="header-info">
                        <div className="info-item">
                            <div className="info-label">{t("miningIndex.clubName")}</div>
                            <div className="info-value font-price">
                                {tierInfo.nowPrice} USDT/VIP
                            </div>
                        </div>
                        <div className="info-item info-desc">
                            {t("miningIndex.currentPromotion")}
                        </div>
                        <div className="info-item info-desc">&nbsp;</div>
                    </div>
                </div>

                <div className="current-power">{t("miningIndex.priceIncreaseNote")}</div>

                <div className="section-label">
                    {t("miningIndex.currentVipPrice", { price: tierInfo.nowPrice })}
                </div>
                <div className="vip-list">
                    {[1, 2, 3, 4, 5].map(item => {
                        const isActive =
                            (item < 5 &&
                                quantity >= (item - 1) * 10 + 1 &&
                                quantity <= item * 10) ||
                            (item === 5 && quantity >= 41);
                        const isDisabled = (item - 1) * 10 + 1 > tierInfo.remainingInTier;
                        return (
                            <button
                                key={item}
                                type="button"
                                className={`vip-item ${isActive ? "active" : ""} ${isDisabled ? "disabled" : ""}`}
                                onClick={() => selectVip(item)}
                                disabled={isDisabled}
                            >
                                {item * 10}
                            </button>
                        );
                    })}
                </div>

                <div className="current-power">{t("miningIndex.complimentaryNode")}</div>

                <div className="section-label">{t("miningIndex.selectVipQuantity")}</div>
                <div className="buy-amount">
                    <div className="buy-control">
                        <button
                            type="button"
                            onClick={decreaseQuantity}
                            disabled={quantity <= 1}
                            className={quantity <= 1 ? "disabled" : ""}
                        >
                            -
                        </button>
                        <div className="buy-input">{quantity}</div>
                        <button
                            type="button"
                            onClick={increaseQuantity}
                            disabled={quantity >= tierInfo.remainingInTier}
                            className={quantity >= tierInfo.remainingInTier ? "disabled" : ""}
                        >
                            +
                        </button>
                    </div>
                </div>

                <div className="current-power">
                    {t("miningIndex.totalPayment", {
                        price: totalPrice,
                        quantity,
                    })}
                    {currentGiftNodes > 0 ? (
                        <div className="gift-tip">
                            {t("miningIndex.extraGiftNodes", { count: currentGiftNodes })}
                        </div>
                    ) : null}
                </div>

                <div className="section-label">{t("miningIndex.dataDetails")}</div>
                <div className="header detail-card">
                    <div className="header-info">
                        <div className="info-item">
                            <div className="info-label">{t("miningIndex.totalMineable")}</div>
                            <div className="info-value">
                                {formatNumber(nodeInfo.ent_issue_num)} ENT
                            </div>
                        </div>
                        <div className="info-item">
                            <div className="info-label">{t("miningIndex.fixedHashrate")}</div>
                            <div className="info-value">{nodeInfo.power}A</div>
                        </div>
                        <div className="info-item">
                            <div className="info-label">{t("miningIndex.variableHashrate")}</div>
                            <div className="info-value muted">{t("miningIndex.notAvailable")}</div>
                        </div>
                        <div className="info-item">
                            <div className="info-label">{t("miningIndex.overallDailyOutput")}</div>
                            <div className="info-value">≈ {formatNumber(dailyOutput)} ENT</div>
                        </div>
                        <div className="info-item">
                            <div className="info-label">{t("miningIndex.accelerateRelease")}</div>
                            <div className="info-value">35%</div>
                        </div>
                    </div>
                </div>

                {userCanBuy ? (
                    <button
                        className={`buy-button ${isSubmitting ? "global-btn-disabled" : ""}`}
                        type="button"
                        onClick={buyNode}
                        disabled={waitPay}
                    >
                        {waitPay
                            ? t("miningIndex.processing")
                            : t("miningIndex.buy", { price: totalPrice })}
                    </button>
                ) : (
                    <button className="buy-button global-btn-disabled" type="button" disabled>
                        {t("miningIndex.comingSoon")}
                    </button>
                )}
            </div>

            {waitPay ? (
                <div className="pay-overlay">
                    {!showLoadingText2 ? (
                        <div className="loading-box">
                            <div className="flex-center">
                                <Spinner size="large" />
                                <div className="loading-text">{loadingText}</div>
                            </div>
                            <div className="loading-tips">
                                {t("miningIndex.waitForChainConfirmation")}
                            </div>
                        </div>
                    ) : (
                        <div className="loading-text center">
                            {t("miningIndex.paymentError")}
                            <button
                                type="button"
                                className="link-text"
                                onClick={() => navigate("/account/billing")}
                            >
                                {t("miningIndex.myRecords")}
                            </button>
                        </div>
                    )}
                </div>
            ) : null}

            <PaySuccDialog
                open={showPaySuccDialog}
                onClose={() => setShowPaySuccDialog(false)}
                onJump={() => navigate("/vip")}
            />
            <AgntDialog open={showAgntDialog} onClose={() => setShowAgntDialog(false)} />

            <style jsx>{`
                .vip-purchase-page {
                    color: #fff;
                }

                .body-content {
                    padding: 18px 16px 100px;
                    font-family: Rubik, sans-serif;
                    font-size: 12px;
                }

                .section-label {
                    font-size: 13px;
                    font-weight: 700;
                    color: #fff;
                    margin-bottom: 6px;
                }

                .header {
                    height: 118px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    padding: 12px;
                    gap: 12px;
                }

                .header-image-wrapper {
                    position: relative;
                    width: 80px;
                    height: 96px;
                    border-radius: 12px;
                    overflow: hidden;
                    align-self: flex-end;
                }

                .header-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .image-icon {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 28px;
                    height: 28px;
                    background: rgba(255, 255, 255, 0.45);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border-bottom-left-radius: 12px;
                }

                .image-icon img {
                    width: 20px;
                    height: 20px;
                }

                .header-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .info-item {
                    display: flex;
                    justify-content: space-between;
                    line-height: 20px;
                }

                .info-label {
                    font-size: 12px;
                    color: rgba(224, 224, 224, 1);
                    min-width: 140px;
                }

                .info-value {
                    flex-grow: 1;
                    margin-left: 8px;
                    font-size: 12px;
                    color: #ffffff;
                    font-weight: 700;
                }

                .info-value.muted {
                    color: rgba(184, 184, 184, 1);
                }

                .font-price {
                    font-size: 14px;
                    font-weight: 700;
                    background: linear-gradient(
                        146.07deg,
                        rgba(235, 20, 132, 1) 0%,
                        rgba(201, 28, 195, 1) 99.99%,
                        rgba(200, 28, 197, 1) 100.99%,
                        rgba(200, 28, 197, 1) 101.99%
                    );
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .info-desc {
                    font-size: 11px;
                    line-height: 16px;
                    color: rgba(240, 240, 240, 1);
                }

                .vip-list {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                    gap: 8px;
                }

                .vip-item {
                    flex: 1;
                    min-width: 50px;
                    padding: 8px 6px;
                    border-radius: 18px;
                    background: rgba(199, 199, 199, 0.08);
                    border: 1px solid rgba(235, 20, 132, 0.4);
                    box-shadow: 0 2px 8px rgba(235, 20, 132, 0.32);
                    font-size: 14px;
                    font-weight: 700;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: #ffffff;
                }

                .vip-item.active {
                    background: linear-gradient(
                        146.07deg,
                        rgba(235, 20, 132, 1) 0%,
                        rgba(201, 28, 195, 1) 99.99%,
                        rgba(200, 28, 197, 1) 100.99%,
                        rgba(200, 28, 197, 1) 101.99%
                    );
                }

                .vip-item.disabled {
                    opacity: 0.5;
                    pointer-events: none;
                }

                .buy-amount {
                    margin-bottom: 12px;
                }

                .buy-control {
                    height: 52px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-radius: 12px;
                    background: rgba(199, 199, 199, 0.08);
                    border: 1px solid rgba(235, 20, 132, 0.4);
                    box-shadow: 0 2px 8px rgba(235, 20, 132, 0.32);
                    padding: 0 16px;
                }

                .buy-control button {
                    width: 32px;
                    height: 32px;
                    color: #ffffff;
                    font-size: 20px;
                    font-weight: 700;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border-radius: 10px;
                    background: rgba(194, 19, 117, 1);
                    border: 1px solid rgba(235, 20, 132, 0.4);
                    box-shadow: 0 2px 8px rgba(235, 20, 132, 0.32);
                }

                .buy-control button.disabled {
                    opacity: 0.5;
                }

                .buy-input {
                    flex-grow: 1;
                    height: 32px;
                    background: transparent;
                    color: #ffffff;
                    text-align: center;
                    border: none;
                    font-size: 20px;
                    font-weight: 700;
                    line-height: 32px;
                }

                .current-power {
                    margin-bottom: 12px;
                    font-size: 11px;
                    line-height: 18px;
                    color: rgba(166, 166, 166, 1);
                }

                .gift-tip {
                    color: #eb1484;
                    font-size: 12px;
                    margin-top: 4px;
                }

                .detail-card {
                    height: auto;
                }

                .buy-button {
                    position: fixed;
                    z-index: 10;
                    bottom: 20px;
                    left: 0;
                    right: 0;
                    margin: 0 auto;
                    width: calc(100% - 32px);
                    height: 56px;
                    color: #ffffff;
                    font-size: 20px;
                    font-weight: 600;
                    text-shadow: 0 4px 20px rgba(4, 1, 26, 0.47);
                    border: none;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border-radius: 999px;
                    background: linear-gradient(
                        146.07deg,
                        rgba(235, 20, 132, 1) 0%,
                        rgba(201, 28, 195, 1) 99.99%,
                        rgba(200, 28, 197, 1) 100.99%,
                        rgba(200, 28, 197, 1) 101.99%
                    );
                    box-shadow: 0 6px 20px rgba(2, 1, 23, 0.68);
                }

                .global-btn-disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .pay-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 40;
                    background: rgba(0, 0, 0, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                .loading-box {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                }

                .flex-center {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .loading-text {
                    font-size: 16px;
                    font-weight: 700;
                }

                .loading-text.center {
                    text-align: center;
                }

                .loading-tips {
                    font-size: 12px;
                    color: rgba(224, 224, 224, 1);
                    text-align: center;
                }

                .link-text {
                    display: inline-block;
                    color: #ff1a90;
                    text-decoration: underline;
                    background: none;
                    border: none;
                    font-size: 14px;
                    margin-top: 6px;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}

export default VipPurchase;
