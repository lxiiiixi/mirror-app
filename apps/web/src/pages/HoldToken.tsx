import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { images } from "@mirror/assets";
import { formatCurrency, formatDisplayNumber, resolveImageUrl } from "@mirror/utils";
import { artsApiClient } from "../api/artsClient";
import { useAuth } from "../hooks/useAuth";
import { useLoginModalStore } from "../store/useLoginModalStore";
import { useAlertStore } from "../store/useAlertStore";
import { TokenAvatar } from "../components";
import { Spinner } from "../ui";

type AssetItem = {
    name: string;
    balance: number;
    price: number;
    value: number;
    can_list?: boolean;
};

type WorkTokenItem = {
    tokenName: string;
    coverUrl: string;
    tokenBalance: string;
};

const normalizeAssetItems = (payload: unknown): AssetItem[] => {
    const normalizeItem = (item: Record<string, unknown>) => {
        const raw = Number(item?.balance ?? 0);
        const price = Number(item?.price ?? 0);
        return {
            name: String(item?.name ?? item?.token_name ?? ""),
            balance: Number(raw.toFixed(6)),
            price: Number(price.toFixed(6)),
            value: Number((price * raw).toFixed(6)),
            can_list: Boolean(item?.can_list ?? true),
        };
    };

    if (Array.isArray(payload)) {
        return payload.map(item => normalizeItem(item as Record<string, unknown>));
    }

    if (payload && typeof payload === "object") {
        const data = payload as Record<string, unknown>;
        const listCandidate = data?.list ?? data?.balances;
        if (Array.isArray(listCandidate)) {
            return listCandidate.map(item => normalizeItem(item as Record<string, unknown>));
        }

        const fallback: AssetItem[] = [];
        if (data.ent_balance !== undefined) {
            fallback.push({
                name: "ENT",
                balance: Number(data.ent_balance ?? 0),
                price: 0,
                value: 0,
                can_list: true,
            });
        }
        if (data.token_balance !== undefined) {
            fallback.push({
                name: "ART",
                balance: Number(data.token_balance ?? 0),
                price: 0,
                value: 0,
                can_list: true,
            });
        }
        if (data.usdt_balance !== undefined) {
            fallback.push({
                name: "USDT",
                balance: Number(data.usdt_balance ?? 0),
                price: 0,
                value: 0,
                can_list: true,
            });
        }
        return fallback;
    }

    return [];
};

const normalizeWorkTokens = (payload: unknown): WorkTokenItem[] => {
    if (!Array.isArray(payload)) {
        if (
            payload &&
            typeof payload === "object" &&
            Array.isArray((payload as { list?: unknown[] }).list)
        ) {
            return normalizeWorkTokens((payload as { list?: unknown[] }).list);
        }
        return [];
    }

    return payload.map(item => {
        const record = item as Record<string, unknown>;
        const workRecord = (record.Work ?? record.work ?? {}) as Record<string, unknown>;
        const coverRaw =
            (record.CoverURL as string | undefined) ??
            (record.cover_url as string | undefined) ??
            (record.token_cover_url as string | undefined) ??
            "";
        const tokenBalance =
            (workRecord.TokenBalance as string | number | undefined) ??
            (workRecord.token_balance as string | number | undefined) ??
            (record.TokenBalance as string | number | undefined) ??
            (record.token_balance as string | number | undefined) ??
            "";

        return {
            tokenName: String(record.TokenName ?? record.token_name ?? record.name ?? ""),
            coverUrl: resolveImageUrl(coverRaw),
            tokenBalance:
                tokenBalance === undefined || tokenBalance === null ? "" : String(tokenBalance),
        };
    });
};

function HoldToken() {
    const { t } = useTranslation();
    const { isLoggedIn } = useAuth();
    const openLoginModal = useLoginModalStore(state => state.openModal);
    const showAlert = useAlertStore(state => state.show);

    const [assetList, setAssetList] = useState<AssetItem[]>([]);
    const [tokenList, setTokenList] = useState<WorkTokenItem[]>([]);
    const [loading, setLoading] = useState(false);

    const listedAssets = useMemo(
        () => assetList.filter(item => item.can_list !== false),
        [assetList],
    );

    const refreshTokens = useCallback(async () => {
        if (!isLoggedIn) return;

        setLoading(true);
        try {
            const [assetResponse, tokenResponse] = await Promise.all([
                artsApiClient.user.getAsset(),
                artsApiClient.requestJson<unknown>("GET", "/arts/work/total", {
                    auth: "required",
                }),
            ]);

            setAssetList(normalizeAssetItems(assetResponse.data));
            setTokenList(normalizeWorkTokens(tokenResponse.data));
        } catch (error) {
            console.error("[HoldToken] fetch failed", error);
            showAlert({ message: t("assets.loadFailed"), variant: "error" });
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn, showAlert, t]);

    useEffect(() => {
        void refreshTokens();
    }, [refreshTokens]);

    if (!isLoggedIn) {
        return (
            <div className="hold-token-page">
                <div className="login-content">
                    <div className="login-title text-[28px]">{t("account.login")}</div>
                    <button
                        type="button"
                        className="login-button text-[16px]"
                        onClick={openLoginModal}
                    >
                        <img className="wallet-icon" src={images.account.phantomIcon} alt="" />
                        <span className="wallet-name">Wallet / Email</span>
                    </button>
                </div>
                <style jsx>{`
                    .hold-token-page {
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
        <div className="hold-token-page">
            <div className="top" />
            <div className="top1" />
            {listedAssets.map(item => (
                <div key={`balance-${item.name}`} className="item text-[16px]">
                    <div className="item_item">
                        <div
                            className={`avatar-border ${["ENT", "ART", "USDT"].includes(item.name) ? "no-border" : ""}`}
                        >
                            {item.name === "ENT" ? (
                                <img className="price-icon" src={images.account.ent} alt="" />
                            ) : null}
                            {item.name === "ART" ? (
                                <img className="price-icon" src={images.account.art} alt="" />
                            ) : null}
                            {item.name === "USDT" ? (
                                <img className="price-icon" src={images.account.usdtIcon} alt="" />
                            ) : null}
                        </div>
                    </div>
                    <div className="item_item">
                        <div>{item.name}</div>
                        <div className="item_text text-[12px]">
                            {item.price > 0 ? `$${formatDisplayNumber(item.price)}` : "-"}
                        </div>
                    </div>
                    <div className="item_item item_right flex-1">
                        <div>{formatDisplayNumber(item.balance, 4, "0")}</div>
                        <div className="item_text text-[12px]">{formatCurrency(item.value)}</div>
                    </div>
                </div>
            ))}

            {tokenList.map((item, index) => (
                <div key={`token-${index}`} className="item text-[16px]">
                    <div className="item_item">
                        <div className="avatar-border">
                            <TokenAvatar
                                src={item.coverUrl}
                                showTokenBorder={true}
                                size={44}
                                imageSize={36}
                            />
                        </div>
                    </div>
                    <div className="item_item">
                        <div>{item.tokenName}</div>
                        <div className="item_text text-[12px]">-</div>
                    </div>
                    <div className="item_item flex-1 item_right">
                        <div>
                            {item.tokenBalance ? formatDisplayNumber(item.tokenBalance) : "0"}
                        </div>
                        <div className="item_text text-[12px]">-</div>
                    </div>
                </div>
            ))}

            {loading ? (
                <div className="loading">
                    <Spinner size="large" />
                </div>
            ) : null}

            <style jsx>{`
                :global(.header) {
                    background: #030620;
                }

                .hold-token-page {
                    min-height: 100vh;
                    padding: 10px 0 32px;
                    color: #fff;
                }

                .top {
                    height: 8px;
                }

                .top1 {
                    height: 4px;
                }

                .item {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    margin-left: 15px;
                    margin-right: 15px;
                    border-radius: 10px;
                    opacity: 1;
                    margin-top: 15px;
                    background: linear-gradient(
                        106deg,
                        rgba(255, 255, 255, 0.05) 22%,
                        rgba(255, 255, 255, 0.05) 36%,
                        rgba(255, 255, 255, 0.2) 97%
                    );
                    color: white;
                    box-sizing: border-box;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    padding: 10px 15px;
                    backdrop-filter: blur(50px);
                    box-shadow: inset 0 2px 2px 0 rgba(0, 0, 0, 0.25);
                }

                .item_item {
                    display: flex;
                    flex-direction: column;
                }

                .flex-1 {
                    flex: 1;
                }

                .item_text {
                    color: #c0c0c6;
                }

                .item_right {
                    align-items: flex-end;
                }

                .avatar-border {
                    margin-right: 10px;
                    display: flex;
                    width: 44px;
                    height: 44px;
                }

                .avatar-border.no-border {
                    background: none;
                }

                .price-icon {
                    margin: auto;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    object-fit: cover;
                }

                .loading {
                    position: fixed;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0, 0, 0, 0.25);
                    z-index: 40;
                }
            `}</style>
        </div>
    );
}

export default HoldToken;
