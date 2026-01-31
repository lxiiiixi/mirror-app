import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { artsApiClient } from "../api/artsClient";
import { images } from "@mirror/assets";
import { useAuth } from "../hooks/useAuth";
import { useAlertStore } from "../store/useAlertStore";
import { Spinner } from "../ui";
import { RechargeWithdrawalDialog } from "../components/Account/RechargeWithdrawalDialog";
import { useLegalRestrictionStore } from "../store/useLegalRestrictionStore";
import { GlassButton, LinearDivider, UserInfo, WithdrawButton } from "../components/Assets";
import { displayNumber } from "@mirror/utils";

interface AssetState {
    ent_balance?: string | number;
    usdt_balance?: string | number;
    token_balance?: string | number;
    nft_count?: number;
}

function Assets() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isLoggedIn, isEmailLogin } = useAuth();
    const showAlert = useAlertStore(state => state.show);
    const showLegalRestriction = useLegalRestrictionStore(state => state.show);

    const [assets, setAssets] = useState<AssetState>({});
    const [walletAddress, setWalletAddress] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
    const [withdrawDialogTab, setWithdrawDialogTab] = useState<"recharge" | "withdraw">("recharge");

    const refreshAssets = useCallback(async () => {
        if (!isLoggedIn) return;

        setLoading(true);
        try {
            const [assetResponse, walletResponse] = await Promise.all([
                artsApiClient.user.getAsset(),
                artsApiClient.user.getWallets(),
            ]);

            setAssets(assetResponse.data ?? {});

            const wallets = walletResponse.data?.wallets ?? [];
            const primary = wallets.find(wallet => wallet.is_primary) ?? wallets[0];
            setWalletAddress(primary?.wallet_address ?? "");
            setEmail(walletResponse.data?.bound_email ?? "");
        } catch (error) {
            console.error("[Assets] fetch failed", error);
            showAlert({ message: t("assets.loadFailed"), variant: "error" });
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn, showAlert, t]);

    useEffect(() => {
        void refreshAssets();
    }, [refreshAssets]);

    const total = useMemo(() => {
        const ent = Number(assets.ent_balance ?? 0);
        const usdt = Number(assets.usdt_balance ?? 0);
        const token = Number(assets.token_balance ?? 0);
        const sum = ent + usdt + token;
        return Number.isFinite(sum) ? sum : 0;
    }, [assets.ent_balance, assets.usdt_balance, assets.token_balance]);

    const handleCopyAddress = async () => {
        if (!walletAddress) return;
        try {
            await navigator.clipboard.writeText(walletAddress);
            showAlert({ message: t("account.copySu"), variant: "success" });
        } catch (error) {
            console.error("[Assets] copy failed", error);
            showAlert({ message: t("account.copyFailed"), variant: "error" });
        }
    };

    const handleOpenWithdrawDialog = (tab: "recharge" | "withdraw") => {
        const allowByEmail = isEmailLogin || Boolean(email);
        if (!allowByEmail) {
            showLegalRestriction();
            return;
        }
        setWithdrawDialogTab(tab);
        setWithdrawDialogOpen(true);
    };

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/");
        }
    }, [isLoggedIn, navigate]);

    if (!isLoggedIn) {
        return null;
    }

    return (
        <div className="min-h-screen">
            <div className="flex flex-col gap-4">
                {/* 顶部总资产卡片：设计稿渐变 + 标题 + 大数字 + Refresh */}
                <div className="rounded-2xl bg-linear-to-br from-[#ad7eff] via-[#7a39fd] to-[#7c1af3] px-5 py-5">
                    <div className="text-[15px] font-semibold text-white/95">
                        {t("account.balanceTotal", { d: "USDT" })}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                        <span className="text-2xl font-semibold tracking-wide sm:text-3xl">
                            {displayNumber(total, 2)}
                        </span>
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/35 px-3 py-2 text-[13px] font-semibold text-white"
                            onClick={refreshAssets}
                        >
                            <span>{t("account.refresh")}</span>
                            <img src={images.account.refresh} alt="" className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* 玻璃卡片：资产 2x2 + 分隔线 + 钱包/复制 */}
                <div className="rounded-2xl border-2 border-white/30 bg-linear-to-b from-white/5 to-white/20 p-4 backdrop-blur-xl">
                    {/* 2x2 网格 */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <div className="flex items-start gap-2">
                            <img
                                src={images.account.entertainer}
                                alt=""
                                className="mt-0.5 h-6 w-6 shrink-0"
                            />
                            <div className="min-w-0">
                                <div className="text-[13px] font-semibold text-white/90">
                                    {t("account.ent")}
                                </div>
                                <div className="text-[15px] font-medium text-white">
                                    {displayNumber(assets.ent_balance)}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <img
                                src={images.account.usdtIcon}
                                alt=""
                                className="mt-0.5 h-6 w-6 shrink-0"
                            />
                            <div className="min-w-0">
                                <div className="text-[13px] font-semibold text-white/90">
                                    {t("account.rwa_token")}
                                </div>
                                <div className="text-[15px] font-medium text-white">
                                    {displayNumber(assets.usdt_balance)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="my-3 h-px w-full bg-linear-to-r from-[#f063cd] to-[#424afb]" />
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <div className="flex items-start gap-2">
                            <img
                                src={images.account.todayIcon}
                                alt=""
                                className="mt-0.5 h-6 w-6 shrink-0"
                            />
                            <div className="min-w-0">
                                <div className="text-[13px] font-semibold text-white/90">
                                    {t("account.ticket")}
                                </div>
                                <div className="text-[15px] font-medium text-[#32f4dd]">
                                    {displayNumber(assets.nft_count ?? 0)}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <img
                                src={images.account.art}
                                alt=""
                                className="mt-0.5 h-6 w-6 shrink-0"
                            />
                            <div className="min-w-0">
                                <div className="text-[13px] font-semibold text-white/90">
                                    {t("account.rwa_ticket")}
                                </div>
                                <div className="text-[15px] font-medium text-white">
                                    {displayNumber(assets.token_balance)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <UserInfo
                        walletAddress={walletAddress}
                        email={email}
                        handleCopyAddress={handleCopyAddress}
                    />
                </div>

                {/* 入口行：玻璃卡片 + 标题 + 右箭头 */}
                <div className="flex flex-col gap-3">
                    <GlassButton route="/account/token" title={t("account.token")} />
                    <GlassButton route="/account/billing" title={t("account.bill")} />
                </div>

                {/* 充值 / 提现：设计稿双按钮 */}
                <WithdrawButton
                    onClick={handleOpenWithdrawDialog}
                    title={t("account.withdrawDialog.title1")}
                />
            </div>

            {loading ? (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/25">
                    <Spinner size="large" />
                </div>
            ) : null}

            <RechargeWithdrawalDialog
                open={withdrawDialogOpen}
                initialTab={withdrawDialogTab}
                walletAddress={walletAddress}
                onClose={() => setWithdrawDialogOpen(false)}
                onSuccess={refreshAssets}
            />
        </div>
    );
}

export default Assets;
