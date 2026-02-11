import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { artsApiClient } from "../api/artsClient";
import { useAlertStore } from "../store/useAlertStore";
import { useAuth } from "../hooks/useAuth";
import { Discover } from "../components/Promotion/Discover";
import { CommissionCard, CommunityCard } from "../components/Promotion/components";
import "../components/Promotion/promotion.css";
import { STORAGE_KEYS, getStorageItem, setStorageItem } from "../utils/localStorage";

function Promotion() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const { isLoggedIn } = useAuth();
    const showAlert = useAlertStore(state => state.show);

    const [today, setToday] = useState("0");
    const [total, setTotal] = useState("0");
    const [inviteCode, setInviteCode] = useState("");
    const [isCanBind, setIsCanBind] = useState(false);
    const [inviteNum, setInviteNum] = useState({ direct_invites: "0/0", indirect_invites: "0/0" });
    const [inviteUrl, setInviteUrl] = useState("");

    const inviteBase = useMemo(() => {
        if (typeof window === "undefined") return "";
        return `${window.location.origin}/?club_invite=`;
    }, []);

    const getInviteData = useCallback(() => {
        const code =
            searchParams.get("club_invite") || getStorageItem(STORAGE_KEYS.clubInvite) || "";
        if (code) {
            setStorageItem(STORAGE_KEYS.clubInvite, code);
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
            const response = await artsApiClient.user.getLevelProgress();
            const data = response.data;
            // const currentLevel = Number(data?.current_level ?? 0) || 0;
            setInviteNum({
                direct_invites: data?.direct_invites ?? "0/0",
                indirect_invites: data?.indirect_invites ?? "0/0",
            });
        } catch (error) {
            console.error("[Promotion] level progress failed", error);
        }
    }, []);

    const refreshInviteData = useCallback(async () => {
        if (!isLoggedIn) return;
        await Promise.all([getInviteInfo(), getInviteNumbers()]);
    }, [getInviteInfo, getInviteNumbers, isLoggedIn]);

    const bindUser = useCallback(async () => {
        if (!inviteCode) return;
        try {
            // TODO 绑定接口有问题 可能是功能没有实现
            await artsApiClient.user.bindUser({
                username: "",
                avatar: "",
            });
            showAlert({ message: t("promotion.bindSu"), variant: "success" });
            setIsCanBind(false);
            void refreshInviteData();
        } catch (error) {
            console.error("[Promotion] bind failed", error);
            showAlert({ message: t("assets.loadFailed"), variant: "error" });
        }
    }, [inviteCode, refreshInviteData, showAlert, t]);

    useEffect(() => {
        getInviteData();
    }, [getInviteData]);

    useEffect(() => {
        void refreshInviteData();
    }, [refreshInviteData]);

    useEffect(() => {
        setIsCanBind(Boolean(isLoggedIn && inviteCode));
    }, [inviteCode, isLoggedIn]);

    return (
        <div id="promotion-page" className="text-[12px]">
            {isCanBind && inviteCode ? (
                <button className="header-title-btn text-[16px]" type="button" onClick={bindUser}>
                    {t("promotion.bindSuperior")}
                </button>
            ) : null}

            <div className="sub-title text-[18px]">{t("promotion.subTitle")}</div>

            {isLoggedIn ? <CommunityCard inviteUrl={inviteUrl} inviteNum={inviteNum} /> : null}

            <CommissionCard today={today} total={total} />

            <div className="tip-text text-[14px]">{t("promotion.tipText")}</div>

            <Discover />
        </div>
    );
}

export default Promotion;
