import { ROUTE_PATHS } from "@mirror/routes";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { artsApiClient } from "../api/artsClient";
import {
    PromotionCommissionCard,
    PromotionCommunityCard,
    PromotionDiscover,
    type PromotionInviteNum,
} from "../components";
import { useAuth } from "../hooks/useAuth";
import { MainTabsLayout } from "../layouts/MainTabsLayout";
import { STORAGE_KEYS, getStorageItem, setStorageItem } from "../utils/localStorage";

type PromotionSearchParams = {
    club_invite?: string | string[];
};

const normalizeQueryParam = (value?: string | string[]) => {
    if (Array.isArray(value)) {
        return (value[0] ?? "").trim();
    }
    return (value ?? "").trim();
};

export default function PromotionPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const params = useLocalSearchParams<PromotionSearchParams>();
    const { isLoggedIn } = useAuth();

    const [today, setToday] = useState("0");
    const [total, setTotal] = useState("0");
    const [inviteCode, setInviteCode] = useState("");
    const [isCanBind, setIsCanBind] = useState(false);
    const [inviteNum, setInviteNum] = useState<PromotionInviteNum>({
        direct_invites: "0/0",
        indirect_invites: "0/0",
    });
    const [inviteUrl, setInviteUrl] = useState("");
    const [savingPoster, setSavingPoster] = useState(false);

    const inviteBase = useMemo(() => {
        const homeUrl = Linking.createURL(ROUTE_PATHS.home);
        return homeUrl.includes("?") ? `${homeUrl}&club_invite=` : `${homeUrl}?club_invite=`;
    }, []);

    const getInviteData = useCallback(async () => {
        const queryCode = normalizeQueryParam(params.club_invite);
        const storedCode = await getStorageItem(STORAGE_KEYS.clubInvite);
        const code = queryCode || storedCode || "";

        if (code) {
            await setStorageItem(STORAGE_KEYS.clubInvite, code);
        }
        setInviteCode(code);
    }, [params.club_invite]);

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

            setInviteNum({
                direct_invites: String(data?.direct_invites ?? "0/0"),
                indirect_invites: String(data?.indirect_invites ?? "0/0"),
            });
        } catch (error) {
            console.error("[Promotion] level progress failed", error);
        }
    }, []);

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

    const refreshInviteData = useCallback(async () => {
        if (!isLoggedIn) {
            return;
        }
        await Promise.all([getInviteInfo(), getInviteNumbers(), checkCanBind()]);
    }, [getInviteInfo, getInviteNumbers, checkCanBind, isLoggedIn]);

    const bindUser = useCallback(async () => {
        if (!inviteCode || !isLoggedIn) {
            return;
        }

        try {
            await artsApiClient.user.bindUser({ code: inviteCode });
            Alert.alert(
                t("common.success", { defaultValue: "Success" }),
                t("promotion.bindSu", { defaultValue: "Bind successful" }),
            );
            setIsCanBind(false);
            void refreshInviteData();
        } catch (error) {
            console.error("[Promotion] bind failed", error);
            Alert.alert(
                t("common.error", { defaultValue: "Error" }),
                t("assets.loadFailed", { defaultValue: "Request failed" }),
            );
        }
    }, [inviteCode, isLoggedIn, refreshInviteData, t]);

    const handleSavePoster = useCallback(async () => {
        if (!inviteUrl || savingPoster) {
            return;
        }

        setSavingPoster(true);
        try {
            await Share.share({
                message: `${t("promotion.subTitle", {
                    defaultValue: "Recommend VIP to enjoy 10-15% commission",
                })}\n${inviteUrl}`,
            });
        } catch (error) {
            console.error("[Promotion] save poster fallback failed", error);
            Alert.alert(
                t("common.error", { defaultValue: "Error" }),
                t("miningShare.saveFailed", { defaultValue: "Failed to save" }),
            );
        } finally {
            setSavingPoster(false);
        }
    }, [inviteUrl, savingPoster, t]);

    const handleShareLink = useCallback(async () => {
        if (!inviteUrl) {
            Alert.alert(
                t("common.error", { defaultValue: "Error" }),
                t("miningShare.sharingNotAvailable", {
                    defaultValue: "Sharing is not yet available",
                }),
            );
            return;
        }

        try {
            await Share.share({
                message: inviteUrl,
            });
        } catch (error) {
            console.error("[Promotion] share link failed", error);
            Alert.alert(
                t("common.error", { defaultValue: "Error" }),
                t("account.copyFailed", { defaultValue: "Share failed" }),
            );
        }
    }, [inviteUrl, t]);

    useEffect(() => {
        void getInviteData();
    }, [getInviteData]);

    useEffect(() => {
        void refreshInviteData();
    }, [refreshInviteData]);

    return (
        <MainTabsLayout activeFooterIndex={2}>
            <View style={styles.page}>
                {isCanBind && inviteCode ? (
                    <Pressable style={styles.bindButton} onPress={() => void bindUser()}>
                        <Text style={styles.bindButtonText}>
                            {t("promotion.bindSuperior", { defaultValue: "Bind the superior" })}
                        </Text>
                    </Pressable>
                ) : null}

                <Text style={styles.subTitle}>
                    {t("promotion.subTitle", {
                        defaultValue: "Recommend VIP to enjoy 10-15% commission",
                    })}
                </Text>

                {isLoggedIn ? (
                    <PromotionCommunityCard
                        inviteUrl={inviteUrl}
                        inviteNum={inviteNum}
                        savingPoster={savingPoster}
                        onSavePosterPress={() => void handleSavePoster()}
                        onShareLinkPress={() => void handleShareLink()}
                    />
                ) : null}

                <PromotionCommissionCard today={today} total={total} />

                <Text style={styles.tipText}>
                    {t("promotion.tipText", {
                        defaultValue:
                            "Claim a token that will increase a hundredfold Double the airdrop when three people form a team",
                    })}
                </Text>

                <PromotionDiscover onNewsPress={() => router.push(ROUTE_PATHS.vip)} />
            </View>
        </MainTabsLayout>
    );
}

const styles = StyleSheet.create({
    // Promotion 页面主容器
    page: {
        gap: 16,
    },
    // 绑定上级按钮
    bindButton: {
        width: "100%",
        height: 44,
        borderRadius: 10,
        backgroundColor: "#EB1484",
        alignItems: "center",
        justifyContent: "center",
    },
    // 绑定上级按钮文字
    bindButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "700",
    },
    // 副标题文字
    subTitle: {
        color: "#e7cbfb",
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
        lineHeight: 24,
    },
    // 提示文案
    tipText: {
        color: "#ffffff",
        fontSize: 14,
        lineHeight: 21,
        textAlign: "center",
        marginTop: -2,
    },
});
