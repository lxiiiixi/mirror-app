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

/**
 * 推广页：展示邀请绑定、会员邀请卡片、佣金统计与发现区。
 * - 非会员无邀请码，不展示 CommunityCard。
 * - 邀请码指 getInviteInfo 返回的 invite_code（当前用户的会员邀请码），非 URL 上的 club_invite。
 */
function Promotion() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const { isLoggedIn } = useAuth();
    const showAlert = useAlertStore(state => state.show);

    // 佣金统计（今日邀请数、累计奖励金额）
    const [today, setToday] = useState("0");
    const [total, setTotal] = useState("0");
    // URL/本地存储中的 club_invite，用于「绑定上级」
    const [inviteCode, setInviteCode] = useState("");
    const [isCanBind, setIsCanBind] = useState(false);
    // 直推/间推人数（来自 levelProgress）
    const [inviteNum, setInviteNum] = useState({ direct_invites: "0/0", indirect_invites: "0/0" });
    // 当前用户自己的邀请链接（inviteBase + 会员邀请码），仅会员有值
    const [inviteUrl, setInviteUrl] = useState("");
    // 当前用户通过 getInviteInfo 拿到的会员邀请码，无则非会员不展示 CommunityCard
    const [myInviteCode, setMyInviteCode] = useState("");

    const inviteBase = useMemo(() => {
        if (typeof window === "undefined") return "";
        return `${window.location.origin}/?club_invite=`;
    }, []);

    /** 从 URL 或本地存储读取 club_invite，供「绑定上级」使用并落库 */
    const getInviteData = useCallback(() => {
        const code =
            searchParams.get("club_invite") || getStorageItem(STORAGE_KEYS.clubInvite) || "";
        if (code) {
            setStorageItem(STORAGE_KEYS.clubInvite, code);
        }
        setInviteCode(code);
    }, [searchParams]);

    /** 拉取当前用户邀请信息（仅会员有 invite_code），用于生成自己的邀请链接与佣金展示 */
    const getInviteInfo = useCallback(async () => {
        try {
            const response = await artsApiClient.node.getInviteInfo();
            const data = response.data;
            const inviteCodeValue = String(data?.invite_code ?? "");
            setToday(String(data?.total_invites ?? 0));
            setTotal(String(data?.total_rewards ?? 0));
            setInviteUrl(`${inviteBase}${inviteCodeValue}`);
            setMyInviteCode(inviteCodeValue);
        } catch (error) {
            console.error("[Promotion] invite info failed", error);
            setMyInviteCode("");
        }
    }, [inviteBase]);

    /** 拉取等级进度（直推/间推人数） */
    const getInviteNumbers = useCallback(async () => {
        try {
            const response = await artsApiClient.user.getLevelProgress();
            const data = response.data;
            setInviteNum({
                direct_invites: data?.direct_invites ?? "0/0",
                indirect_invites: data?.indirect_invites ?? "0/0",
            });
        } catch (error) {
            console.error("[Promotion] level progress failed", error);
        }
    }, []);

    /** 检查是否可绑定上级：已登录且尚未绑定过（/user/check 的 is_invite 为 false） */
    const checkCanBind = useCallback(async () => {
        if (!isLoggedIn) {
            setIsCanBind(false);
            return;
        }
        try {
            const response = await artsApiClient.user.checkUserWhitelist();
            setIsCanBind(!response.data?.is_invite);
        } catch {
            setIsCanBind(false);
        }
    }, [isLoggedIn]);

    /** 登录后刷新邀请与等级数据 */
    const refreshInviteData = useCallback(async () => {
        if (!isLoggedIn) return;
        await Promise.all([getInviteInfo(), getInviteNumbers(), checkCanBind()]);
    }, [getInviteInfo, getInviteNumbers, checkCanBind, isLoggedIn]);

    /** 使用 URL 上的 club_invite 调用绑定上级接口 */
    const bindUser = useCallback(async () => {
        if (!inviteCode) return;
        try {
            await artsApiClient.user.bindUser({ code: inviteCode });
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

    // 仅当已登录且当前用户有会员邀请码时展示邀请卡片（非会员无 invite_code，不展示）
    const showCommunityCard = Boolean(isLoggedIn && myInviteCode);

    return (
        <div id="promotion-page" className="text-[12px]">
            {isCanBind && inviteCode ? (
                <button className="header-title-btn text-[16px]" type="button" onClick={bindUser}>
                    {t("promotion.bindSuperior")}
                </button>
            ) : null}

            <div className="sub-title text-[18px]">{t("promotion.subTitle")}</div>

            {showCommunityCard ? (
                <CommunityCard inviteUrl={inviteUrl} inviteNum={inviteNum} />
            ) : null}

            <CommissionCard today={today} total={total} />

            <Discover />
        </div>
    );
}

export default Promotion;
