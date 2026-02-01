import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { artsApiClient } from "../../api/artsClient";
import { useAlertStore } from "../../store/useAlertStore";
import { Input, Modal, Select } from "../../ui";
import { images } from "@mirror/assets";

interface AssetItem {
    name: string;
    balance: number;
    can_recharge?: boolean;
    can_withdraw?: boolean;
}

export interface RechargeWithdrawalDialogProps {
    open: boolean;
    initialTab?: "recharge" | "withdraw";
    walletAddress?: string;
    onClose: () => void;
    onSuccess?: () => void;
}

const normalizeAssetList = (payload: unknown): AssetItem[] => {
    const mapItem = (item: Record<string, unknown>): AssetItem => {
        return {
            name: String(item.name ?? ""),
            balance: Number(item.balance ?? 0),
            can_recharge: item.can_recharge === undefined ? true : Boolean(item.can_recharge),
            can_withdraw: item.can_withdraw === undefined ? true : Boolean(item.can_withdraw),
        };
    };

    if (Array.isArray(payload)) {
        return payload.map(item => mapItem(item as Record<string, unknown>));
    }

    if (payload && typeof payload === "object") {
        const data = payload as Record<string, unknown>;
        const list = data.list ?? data.balances;
        if (Array.isArray(list)) {
            return list.map(item => mapItem(item as Record<string, unknown>));
        }

        const fallback: AssetItem[] = [];
        if (data.ent_balance !== undefined) {
            fallback.push({ name: "ENT", balance: Number(data.ent_balance ?? 0) });
        }
        if (data.token_balance !== undefined) {
            fallback.push({ name: "ART", balance: Number(data.token_balance ?? 0) });
        }
        if (data.usdt_balance !== undefined) {
            fallback.push({ name: "USDT", balance: Number(data.usdt_balance ?? 0) });
        }
        return fallback;
    }

    return [];
};

const formatAmount = (value?: string) => {
    const numeric = Number(value ?? "");
    if (!Number.isFinite(numeric)) return "";
    return numeric % 1 === 0 ? `${numeric}.0` : `${numeric}`;
};

// 可充值和提现的资产是根据 /asset 接口中的 can_recharge 和 can_withdraw 字段决定的

export function RechargeWithdrawalDialog({
    open,
    initialTab = "recharge",
    walletAddress,
    onClose,
    onSuccess,
}: RechargeWithdrawalDialogProps) {
    const { t } = useTranslation();
    const showAlert = useAlertStore(state => state.show);

    const [activeTab, setActiveTab] = useState(initialTab === "withdraw" ? 1 : 0);
    const [amount, setAmount] = useState("");
    const [currency, setCurrency] = useState("");
    const [assets, setAssets] = useState<AssetItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;
        setActiveTab(initialTab === "withdraw" ? 1 : 0);
    }, [initialTab, open]);

    const fetchAssets = useCallback(async () => {
        if (!open) return;
        setLoading(true);
        try {
            const response = await artsApiClient.user.getAsset();
            setAssets(normalizeAssetList(response.data));
        } catch (error) {
            console.error("[RechargeWithdrawalDialog] load assets failed", error);
            showAlert({ message: t("assets.loadFailed"), variant: "error" });
        } finally {
            setLoading(false);
        }
    }, [open, showAlert, t]);

    useEffect(() => {
        void fetchAssets();
    }, [fetchAssets]);

    const availableCurrencies = useMemo(() => {
        return assets.filter(item =>
            activeTab === 0 ? item.can_recharge !== false : item.can_withdraw !== false,
        );
    }, [activeTab, assets]);

    const currencyOptions = useMemo(
        () =>
            availableCurrencies.map(item => {
                const iconSrc =
                    item.name === "ENT"
                        ? images.account.ent
                        : item.name === "ART"
                          ? images.account.art
                          : item.name === "USDT"
                            ? images.account.usdtIcon
                            : undefined;
                return { value: item.name, label: item.name, iconSrc };
            }),
        [availableCurrencies],
    );

    useEffect(() => {
        if (!availableCurrencies.length) {
            setCurrency("");
            return;
        }
        if (!availableCurrencies.some(item => item.name === currency)) {
            setCurrency(availableCurrencies[0].name);
        }
    }, [availableCurrencies, currency]);

    const currentBalance = useMemo(() => {
        return assets.find(item => item.name === currency)?.balance ?? 0;
    }, [assets, currency]);

    const handleSubmit = useCallback(async () => {
        if (!currency) {
            showAlert({ message: t("account.withdrawDialog.selectCurrency"), variant: "error" });
            return;
        }
        const numericValue = Number(amount);
        if (!Number.isFinite(numericValue) || numericValue <= 0) {
            showAlert({ message: t("account.withdrawDialog.placeholder"), variant: "error" });
            return;
        }

        setLoading(true);

        try {
            if (activeTab === 0) {
                // 充值
                // 目前的充值暂时只支持用户自己钱包登陆的情况
                const payload = { signed_tx: formatAmount(amount) };
                if (currency === "USDT") {
                    await artsApiClient.deposit.depositUsdt(payload);
                } else if (currency === "ENT") {
                    await artsApiClient.deposit.depositEnt(payload);
                } else {
                    await artsApiClient.deposit.deposit(payload);
                }
                showAlert({
                    message: t("account.withdrawDialog.depositSuccess"),
                    variant: "success",
                });
            } else {
                // 提现
                const target = walletAddress?.trim();
                if (!target) {
                    showAlert({
                        message: t("account.withdrawDialog.selectCurrency"),
                        variant: "error",
                    });
                    return;
                }

                if (currency === "USDT") {
                    await artsApiClient.deposit.withdrawUsdt({
                        amount: formatAmount(amount),
                        to_address: target,
                        chain: "solana",
                    });
                } else {
                    await artsApiClient.requestJson("POST", "/arts/node/mining/claim", {
                        auth: "required",
                        body: {
                            target_address: target,
                            amount: formatAmount(amount),
                        },
                    });
                }

                showAlert({ message: t("account.withdrawDialog.success"), variant: "success" });
            }

            onSuccess?.();
            onClose();
        } catch (error) {
            console.error("[RechargeWithdrawalDialog] submit failed", error);
            showAlert({ message: t("assets.loadFailed"), variant: "error" });
        } finally {
            setLoading(false);
        }
    }, [activeTab, amount, currency, onClose, onSuccess, showAlert, t, walletAddress]);

    return (
        <div>
            <Modal open={open} title={t("account.withdrawDialog.title1")} onClose={onClose}>
                <div className="dialog-content">
                    <div className="bottom">
                        <div className="bottom-tab">
                            <button
                                type="button"
                                className={activeTab === 0 ? "recharge-btn sel" : "recharge-btn"}
                                onClick={() => setActiveTab(0)}
                            >
                                {t("account.withdrawDialog.title")}
                            </button>
                            <button
                                type="button"
                                className={
                                    activeTab === 1
                                        ? "recharge-btn sel right"
                                        : "recharge-btn right"
                                }
                                onClick={() => setActiveTab(1)}
                            >
                                {t("account.withdrawDialog.confirm")}
                            </button>
                        </div>

                        <div className="bottom-text">
                            {activeTab === 0
                                ? t("account.withdrawDialog.recharge_currency")
                                : t("account.withdrawDialog.withdraw_currency")}
                        </div>

                        <Select
                            value={currency}
                            options={currencyOptions}
                            placeholder={t("account.withdrawDialog.selectCurrency")}
                            onValueChange={setCurrency}
                        />

                        <div className="bottom-text">
                            {activeTab === 0
                                ? t("account.withdrawDialog.recharge_number")
                                : t("account.withdrawDialog.withdraw_number")}
                        </div>

                        <Input
                            className="mt-2"
                            type="number"
                            inputSize="lg"
                            value={amount}
                            onChange={event => setAmount(event.target.value)}
                            placeholder={t("account.withdrawDialog.placeholder")}
                        />

                        {currency ? (
                            <div className="bottom-text tips">
                                {t("account.withdrawDialog.currentMax", {
                                    num: currentBalance || 0,
                                })}
                            </div>
                        ) : null}

                        <button
                            type="button"
                            className="bottom-btn"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {activeTab === 0
                                ? t("account.withdrawDialog.recharge_btn")
                                : t("account.withdrawDialog.withdraw_btn")}
                        </button>
                    </div>
                </div>
            </Modal>
            <style jsx>{`
                .bottom {
                    margin-left: auto;
                    margin-right: auto;
                }

                .bottom-tab {
                    display: flex;
                    flex-direction: row;
                }

                .recharge-btn {
                    flex: 1;
                    border-radius: 10px;
                    font-size: 14px;
                    padding: 8px 0;
                    font-weight: 600;
                    color: white;
                    text-align: center;
                    border: 1px solid #ffffff;
                    background: transparent;
                    cursor: pointer;
                }

                .recharge-btn.right {
                    margin-left: 12px;
                }

                .recharge-btn.sel {
                    border: none;
                    background: linear-gradient(90deg, #f063cd 0%, #424afb 100%);
                }

                .bottom-text {
                    color: white;
                    font-size: 13px;
                    margin-top: 14px;
                }

                :global(.select-root) {
                    margin-top: 10px;
                }

                .tips {
                    color: #bfc0c6;
                }

                .bottom-btn {
                    width: 100%;
                    margin-top: 18px;
                    padding: 10px 0;
                    text-align: center;
                    color: white;
                    border-radius: 10px;
                    background: #eb1484;
                    border: none;
                    cursor: pointer;
                }

                .bottom-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
}
