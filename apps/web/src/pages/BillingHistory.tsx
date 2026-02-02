import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { images } from "@mirror/assets";
import { formatDateTime } from "@mirror/utils";
import { artsApiClient } from "../api/artsClient";
import { useAuth } from "../hooks/useAuth";
import { useLoginModalStore } from "../store/useLoginModalStore";
import { useAlertStore } from "../store/useAlertStore";
import { Spinner } from "../ui";

type RecordItem = {
    amount: string;
    createTime: string;
    content: string;
    type?: number;
    num?: number;
    status?: string;
};

const PAGE_SIZE = 20;

/** 账单列表金额：空值返回 "-"，否则原样数字字符串（不做千分位） */
const formatAmount = (value?: string | number) => {
    if (value === undefined || value === null || value === "") return "-";
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) return String(value);
    return numberValue.toString();
};

const normalizeRecords = (payload: unknown): RecordItem[] => {
    const toRecord = (item: Record<string, unknown>): RecordItem => {
        const amountRaw = (item.amount ?? item.Amount ?? item.value ?? "") as string;
        const contentRaw = item.content ?? item.ticket_name ?? item.name ?? item.title ?? "";
        const createTimeRaw =
            (item.createTime as string | undefined) ??
            (item.create_time as string | undefined) ??
            (item.time as string | undefined) ??
            "";
        const numRaw = item.num ?? item.quantity ?? item.count ?? undefined;

        return {
            amount: formatAmount(amountRaw),
            content: String(contentRaw ?? ""),
            createTime: String(createTimeRaw ?? ""),
            type: item.type === undefined ? undefined : Number(item.type),
            num: numRaw === undefined ? undefined : Number(numRaw),
            status: item.status === undefined ? undefined : String(item.status),
        };
    };

    if (Array.isArray(payload)) {
        return payload.map(item => toRecord(item as Record<string, unknown>));
    }

    if (payload && typeof payload === "object") {
        const data = payload as Record<string, unknown>;
        const list = data.list ?? data.records ?? data.items ?? data.data;
        if (Array.isArray(list)) {
            return list.map(item => toRecord(item as Record<string, unknown>));
        }
    }

    return [];
};

function BillingHistory() {
    const { t } = useTranslation();
    const { isLoggedIn } = useAuth();
    const openLoginModal = useLoginModalStore(state => state.openModal);
    const showAlert = useAlertStore(state => state.show);

    const [activeTab, setActiveTab] = useState(1);
    const [showType, setShowType] = useState(false);
    const [selectType, setSelectType] = useState(1);
    const [records, setRecords] = useState<RecordItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const pageRef = useRef(1);
    const inFlightRef = useRef(false);
    const hasMoreRef = useRef(hasMore);
    const loadingRef = useRef(false);

    useEffect(() => {
        hasMoreRef.current = hasMore;
    }, [hasMore]);

    useEffect(() => {
        loadingRef.current = loading || loadingMore;
    }, [loading, loadingMore]);

    const typeOptions = useMemo(
        () => [
            { value: 1, label: t("assets.typeTicket") },
            { value: 2, label: t("assets.typeVip") },
            { value: 3, label: t("assets.typeMining") },
            { value: 4, label: t("assets.typeAirdrop") },
            { value: 5, label: t("assets.typeRecharge") },
            { value: 6, label: t("assets.typeWithdraw") },
        ],
        [t],
    );

    const fetchRecords = useCallback(
        async (targetPage: number, append: boolean) => {
            if (!isLoggedIn || inFlightRef.current) return;

            inFlightRef.current = true;
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            try {
                const response = await artsApiClient.requestJson<unknown>(
                    "GET",
                    "/arts/ticket/my/ticket_record",
                    {
                        auth: "required",
                        query: {
                            page: targetPage,
                            page_size: PAGE_SIZE,
                            type: selectType,
                            income: activeTab,
                        },
                    },
                );

                const nextRecords = normalizeRecords(response.data);
                setRecords(prev => (append ? [...prev, ...nextRecords] : nextRecords));
                setHasMore(nextRecords.length >= PAGE_SIZE);
                pageRef.current = targetPage;
            } catch (error) {
                console.error("[BillingHistory] fetch failed", error);
                // showAlert({ message: t("assets.loadFailed"), variant: "error" });
                setHasMore(false);
            } finally {
                inFlightRef.current = false;
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [activeTab, isLoggedIn, selectType],
    );

    useEffect(() => {
        if (typeof window === "undefined") return;

        const scrollTarget =
            (document.querySelector("main.content") as HTMLElement | null) ?? window;
        const element = scrollTarget instanceof HTMLElement ? scrollTarget : window;
        const isWindow = (target: Window | HTMLElement): target is Window => target === window;

        const handleScroll = () => {
            if (!hasMoreRef.current || loadingRef.current) return;

            const scrollTop = isWindow(element) ? window.scrollY : element.scrollTop;
            const clientHeight = isWindow(element) ? window.innerHeight : element.clientHeight;
            const scrollHeight = isWindow(element)
                ? document.documentElement.scrollHeight
                : element.scrollHeight;

            if (scrollHeight - scrollTop - clientHeight < 120) {
                void fetchRecords(pageRef.current + 1, true);
            }
        };

        element.addEventListener("scroll", handleScroll);
        return () => {
            element.removeEventListener("scroll", handleScroll);
        };
    }, [fetchRecords]);

    const handleTabChange = (tab: number) => {
        if (tab === activeTab) return;
        setActiveTab(tab);
        setShowType(false);
    };

    const handleTypeChange = (value: number) => {
        if (value === selectType) return;
        setSelectType(value);
        setShowType(false);
    };

    useEffect(() => {
        pageRef.current = 1;
        setRecords([]);
        setHasMore(true);
        void fetchRecords(1, false);
    }, [activeTab, selectType, fetchRecords]);

    const resolveRecordTitle = (item: RecordItem) => {
        if (selectType === 2) {
            return t("miningRecords.payVip", {
                amount: item.amount,
                num: item.num ?? 0,
            });
        }

        if (selectType === 1) {
            const suffixMap: Record<number, string> = {
                43: t("ticket.record.presale"),
                44: t("ticket.record.pay"),
                41: t("ticket.record.direct"),
                42: t("ticket.record.indirect"),
            };
            const suffix = item.type ? (suffixMap[item.type] ?? "") : "";
            return `${item.content ?? ""}${suffix}`.trim() || item.content;
        }

        return item.content || t("miningRecords.transactionStatus", { status: item.status ?? "-" });
    };

    const resolveAmount = (item: RecordItem) => {
        const numeric = Number(item.amount);
        if (Number.isFinite(numeric)) {
            return numeric > 0 ? `+${item.amount}` : `${item.amount}`;
        }
        return item.amount || "-";
    };

    if (!isLoggedIn) {
        return (
            <div className="billing-page">
                <div className="login-content">
                    <div className="login-title text-[28px]">{t("account.login")}</div>
                    <button type="button" className="login-button text-[16px]" onClick={openLoginModal}>
                        <img className="wallet-icon" src={images.account.phantomIcon} alt="" />
                        <span className="wallet-name">Wallet / Email</span>
                    </button>
                </div>
                <style jsx>{`
                    .billing-page {
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
        <div className="billing-page">
            <div className="top" />
            <div className="top1" />

            <div className="body-content text-[12px]">
                <div className="top-lay">
                    <div className="top-left">
                        <button
                            type="button"
                            className={`top-lay-view text-[13px] ${activeTab === 1 ? "sel" : ""}`}
                            onClick={() => handleTabChange(1)}
                        >
                            {t("miningRecords.income")}
                        </button>
                        <button
                            type="button"
                            className={`top-lay-view text-[13px] ${activeTab === 2 ? "sel" : ""}`}
                            onClick={() => handleTabChange(2)}
                        >
                            {t("miningRecords.expenditure")}
                        </button>
                    </div>
                    <button
                        type="button"
                        className="top-lay-view text-[13px]"
                        onClick={() => setShowType(prev => !prev)}
                    >
                        <span>{t("miningRecords.type")}</span>
                        <img
                            src={showType ? images.mining.billUp : images.mining.billDown}
                            alt=""
                        />
                    </button>
                </div>

                {showType ? (
                    <div className="type-lay type-top">
                        {typeOptions.slice(0, 3).map(option => (
                            <button
                                key={option.value}
                                type="button"
                                className={`${option.value === selectType ? "type-sel" : ""} text-[12px]`}
                                onClick={() => handleTypeChange(option.value)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                ) : null}

                {showType ? (
                    <div className="type-lay type-top">
                        {typeOptions.slice(3).map(option => (
                            <button
                                key={option.value}
                                type="button"
                                className={`${option.value === selectType ? "type-sel" : ""} text-[12px]`}
                                onClick={() => handleTypeChange(option.value)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                ) : null}

                {records.map((item, index) => (
                    <div className="record-item text-[14px]" key={`${item.createTime}-${index}`}>
                        <div className="record-info">
                            <div className="record-amount-info">{resolveRecordTitle(item)}</div>
                            <div className="record-date text-[12px]">{formatDateTime(item.createTime)}</div>
                        </div>
                        <div className="record-status text-[15px]">{resolveAmount(item)}</div>
                    </div>
                ))}

                {!loading && !loadingMore && records.length === 0 ? (
                    <div className="empty-state text-[14px]">
                        {t("billingHistory.noData", { defaultValue: "No data" })}
                    </div>
                ) : null}

                {loading || loadingMore ? (
                    <div className="loading">
                        {" "}
                        <Spinner size="large" />{" "}
                    </div>
                ) : null}
            </div>

            <style jsx>{`
                :global(.header) {
                    background: #030620;
                }

                .billing-page {
                    min-height: 100vh;
                    padding: 8px 0 24px;
                    color: #fff;
                }

                .top {
                    height: 8px;
                }

                .top1 {
                    height: 4px;
                }

                .body-content {
                    padding: 10px 0 0;
                    font-family: Rubik, sans-serif;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .top-lay {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                }

                .top-left {
                    display: flex;
                    flex-direction: row;
                }

                .top-lay-view {
                    color: white;
                    padding: 6px 10px;
                    border-radius: 4px;
                    border: 1px solid #ffffff;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    font-weight: 500;
                    background: transparent;
                    cursor: pointer;
                    margin-left: 12px;
                }

                .top-lay-view img {
                    width: 13px;
                    height: 13px;
                }

                .top-lay-view.sel {
                    background: #eb1484;
                    border: 1px solid #eb1484;
                }

                .type-lay {
                    display: flex;
                    flex-direction: row;
                    gap: 10px;
                    margin-top: 8px;
                }

                .type-lay button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid #ffffff;
                    padding: 6px 16px;
                    border-radius: 14px;
                    /* background: transparent; */
                    color: #fff;
                    cursor: pointer;
                    flex: 1;
                }

                .type-top {
                    justify-content: space-between;
                }

                .type-sel {
                    border: none !important;
                    background: linear-gradient(90deg, #f063cd 0%, #424afb 100%);
                }

                .record-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 18px 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
                }

                .record-info {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    gap: 6px;
                }

                .record-amount-info {
                    font-weight: 500;
                    color: #ffffff;
                }

                .record-status {
                    font-weight: 400;
                    min-width: 80px;
                    text-align: right;
                }

                .record-date {
                    color: #c0c0c6;
                }

                .empty-state {
                    text-align: center;
                    color: rgba(255, 255, 255, 0.5);
                    padding: 40px 16px;
                }

                .loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px 0;
                }
            `}</style>
        </div>
    );
}

export default BillingHistory;
