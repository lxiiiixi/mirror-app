import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { artsApiClient } from "../api/artsClient";
import { useAuth } from "../hooks/useAuth";
import { useAlertStore } from "../store/useAlertStore";
import { Spinner } from "../ui";
import { RechargeWithdrawalDialog } from "../components/Account/RechargeWithdrawalDialog";
import { useLegalRestrictionStore } from "../store/useLegalRestrictionStore";
import { GlassButton, OverlapInfoCard, WithdrawButton } from "../components/Assets";
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
                <OverlapInfoCard
                    totalFormatted={displayNumber(total, 2)}
                    onRefresh={refreshAssets}
                    assets={assets}
                    walletAddress={walletAddress}
                    email={email}
                    onCopyAddress={handleCopyAddress}
                />

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
