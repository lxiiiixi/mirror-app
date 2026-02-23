import type { UserLevelProgressItem } from "@mirror/api";
import { images } from "@mirror/assets";
import { ROUTE_PATHS } from "@mirror/routes";
import { formatEnt } from "@mirror/utils";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { artsApiClient } from "../../api/artsClient";
import { useAuth } from "../../hooks/useAuth";
import { themeColors } from "../../theme/colors";
import { toImageSource } from "../../utils/imageSource";

type RewardsState = {
    pending_rewards: number;
    total_base_mining_reward: number;
    total_invite_reward: number;
    total_level_bonus_reward: number;
    total_total_reward: number;
    today_base_mining_reward: number;
    today_invite_reward: number;
    today_level_bonus_reward: number;
    today_total_reward: number;
};

interface ProgressBarProps {
    label?: string;
    value: number;
    max: number;
    valueLabel?: string;
}

function ProgressBar({ label, value, max, valueLabel }: ProgressBarProps) {
    const safeMax = max > 0 ? max : 1;
    const safeValue = value >= 0 ? value : 0;
    const percent = Math.min(100, Math.max(0, (safeValue / safeMax) * 100));

    return (
        <View style={styles.progressWrap}>
            <View style={styles.progressTopRow}>
                <Text style={styles.progressLabel}>{label ?? ""}</Text>
                <Text style={styles.progressValueLabel}>
                    {valueLabel ?? `${safeValue}/${safeMax}`}
                </Text>
            </View>
            <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${percent}%` }]} />
            </View>
        </View>
    );
}

/** 解析 "当前/总数" 格式字符串为 { current, max } */
const parseInviteProgress = (str: string): { current: number; max: number } => {
    const parts = String(str ?? "0/0")
        .split("/")
        .map(s => Number.parseInt(s, 10));
    const current = Number.isFinite(parts[0]) ? parts[0] : 0;
    const max = Number.isFinite(parts[1]) && parts[1] > 0 ? parts[1] : 1;
    return { current, max };
};

export function VipMiningSection() {
    const { t } = useTranslation();
    const router = useRouter();
    const { isLoggedIn } = useAuth();

    const [vipLevel, setVipLevel] = useState(0);
    const [purchasedNodes, setPurchasedNodes] = useState(0);
    const [teamProgress, setTeamProgress] = useState<UserLevelProgressItem>({
        current: 0,
        percentage: 0,
        required: 1,
    });
    const [invitesProgress, setInvitesProgress] = useState<UserLevelProgressItem | null>(null);
    const [inviteNum, setInviteNum] = useState({
        direct_invites: "0/0",
        indirect_invites: "0/0",
    });
    const [rewards, setRewards] = useState<RewardsState>({
        pending_rewards: 0,
        total_base_mining_reward: 0,
        total_invite_reward: 0,
        total_level_bonus_reward: 0,
        total_total_reward: 0,
        today_base_mining_reward: 0,
        today_invite_reward: 0,
        today_level_bonus_reward: 0,
        today_total_reward: 0,
    });
    const [loading, setLoading] = useState(false);

    const fetchVipMiningData = useCallback(async () => {
        if (!isLoggedIn) {
            setVipLevel(0);
            setPurchasedNodes(0);
            setInviteNum({
                direct_invites: "0/0",
                indirect_invites: "0/0",
            });
            setInvitesProgress(null);
            setTeamProgress({
                current: 0,
                percentage: 0,
                required: 1,
            });
            return;
        }

        setLoading(true);
        try {
            const [vipResponse, levelResponse, rewardsResponse] = await Promise.all([
                artsApiClient.user.getVipLevel(),
                artsApiClient.user.getLevelProgress(),
                artsApiClient.node.mining.getRewards(),
            ]);

            const vipData = vipResponse.data;
            const levelData = levelResponse.data;
            const rewardData = rewardsResponse.data;

            setVipLevel(Number(vipData?.user_level ?? 0) || 0);
            setPurchasedNodes(Number(vipData?.personal_nodes ?? 0) || 0);

            const progress = levelData?.next_level_progress;
            setTeamProgress(
                progress?.team_user_progress ?? {
                    current: 0,
                    percentage: 0,
                    required: 1,
                },
            );

            const currentLevel = Number(levelData?.current_level ?? 0);
            type InvitesProgressKey =
                | "v1_invites_progress"
                | "v2_invites_progress"
                | "v3_invites_progress"
                | "v4_invites_progress";
            const inviteProgressKey: InvitesProgressKey | null =
                currentLevel >= 1 && currentLevel <= 4
                    ? (`v${currentLevel}_invites_progress` as InvitesProgressKey)
                    : null;

            setInvitesProgress(
                inviteProgressKey && progress ? (progress[inviteProgressKey] ?? null) : null,
            );
            setInviteNum({
                direct_invites: String(levelData?.direct_invites ?? "0/0"),
                indirect_invites: String(levelData?.indirect_invites ?? "0/0"),
            });

            const rewardsInfo = rewardData?.rewards_info;
            const totalCycle = rewardsInfo?.total_cycle_rewards;
            const todayCycle = rewardsInfo?.today_cycle_rewards;
            setRewards({
                pending_rewards: formatEnt(rewardsInfo?.pending_rewards),
                total_base_mining_reward: formatEnt(totalCycle?.base_mining_reward),
                total_invite_reward: formatEnt(totalCycle?.invite_reward),
                total_level_bonus_reward: formatEnt(totalCycle?.level_bonus_reward),
                total_total_reward: formatEnt(totalCycle?.total_reward),
                today_base_mining_reward: formatEnt(todayCycle?.base_mining_reward),
                today_invite_reward: formatEnt(todayCycle?.invite_reward),
                today_level_bonus_reward: formatEnt(todayCycle?.level_bonus_reward),
                today_total_reward: formatEnt(todayCycle?.total_reward),
            });
        } catch (error) {
            console.error("[VipMiningSection] load failed", error);
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        void fetchVipMiningData();
    }, [fetchVipMiningData]);

    const inviteProgressFallback = useMemo(
        () => parseInviteProgress(inviteNum.direct_invites),
        [inviteNum.direct_invites],
    );

    return (
        <View style={styles.page}>
            <View style={styles.heroCard}>
                <View style={styles.heroPoster}>
                    <Image
                        source={toImageSource(images.account.channel)}
                        style={styles.heroPosterImage}
                        resizeMode="cover"
                    />
                    <View style={styles.heroBadge}>
                        <Image
                            source={toImageSource(images.account.ent)}
                            style={styles.heroBadgeIcon}
                            resizeMode="contain"
                        />
                    </View>
                </View>

                <View style={styles.heroContent}>
                    <View style={styles.heroTitleRow}>
                        <Text style={styles.heroLevelText}>VIP {vipLevel}</Text>
                        <Text style={styles.heroNodesText}>({purchasedNodes}x)</Text>
                    </View>

                    {invitesProgress ? (
                        <ProgressBar
                            value={invitesProgress.current}
                            max={invitesProgress.required}
                            valueLabel={`${invitesProgress.current} / ${invitesProgress.required} VIP${vipLevel}`}
                        />
                    ) : null}

                    <ProgressBar
                        label={t("vipMining.validUsers", { defaultValue: "Valid users:" })}
                        value={teamProgress.current || inviteProgressFallback.current}
                        max={teamProgress.required || inviteProgressFallback.max}
                    />

                    <View style={styles.heroBottomRow}>
                        <Text style={styles.heroSubText}>
                            {t("miningMy.clubVip", { defaultValue: "EntertainFI Club VIP" })}
                        </Text>

                        <Pressable
                            style={styles.buyVipButton}
                            onPress={() => router.push(ROUTE_PATHS.vipPurchase)}
                        >
                            <Text style={styles.buyVipButtonText}>
                                {t("miningMy.buyVip", { defaultValue: "Buy VIP" })}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    {t("miningMy.dataDetails", { defaultValue: "Gift Mining Machine" })}
                </Text>

                <View style={styles.dataCard}>
                    <Image
                        source={toImageSource(images.vip.giftBg)}
                        style={styles.dataCardBg}
                        resizeMode="contain"
                    />

                    <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>
                            {t("vipMining.numberOfVips", { defaultValue: "Number of VlPs :" })}
                        </Text>
                        <Text style={styles.dataValue}>{vipLevel}</Text>
                    </View>

                    <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>
                            {t("miningMy.purchasedNode", {
                                defaultValue: "Number of Mining Machines :",
                            })}
                        </Text>
                        <Text style={styles.dataValue}>{purchasedNodes}</Text>
                    </View>

                    <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>
                            {t("miningMy.fixedHashrate", { defaultValue: "Fixed power :" })}
                        </Text>
                        <Text style={styles.dataValue}>1500A × {purchasedNodes}</Text>
                    </View>

                    <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>
                            {t("miningMy.accelerateRelease", { defaultValue: "Accelerate :" })}
                        </Text>
                        <Text style={styles.dataValue}>35%</Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    {t("miningMy.todaysMiningData", { defaultValue: "Daily earnings" })}
                </Text>

                <View style={styles.todayCard}>
                    <View style={styles.todayTopRow}>
                        <Image
                            source={toImageSource(images.account.ent2)}
                            style={styles.todayIcon}
                            resizeMode="contain"
                        />

                        <View style={styles.todayTopTextWrap}>
                            <Text style={styles.todayMainValue}>
                                {rewards.today_base_mining_reward} ENT
                            </Text>
                            <Text style={styles.todaySubValue}>{purchasedNodes}X SPEEDUP</Text>
                            <Text style={styles.todayTip}>
                                {t("miningMy.todaysTip", {
                                    defaultValue: "Block mining is updated every 20 minutes",
                                })}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.todayGrid}>
                        <View style={styles.todayGridItem}>
                            <Text style={styles.todayGridValue}>
                                {rewards.today_invite_reward} ENT
                            </Text>
                            <Text style={styles.todayGridLabel}>
                                {t("miningMy.directEarnings", {
                                    defaultValue: "Today Cumulative community income",
                                })}
                            </Text>
                        </View>

                        <View style={styles.todayGridItem}>
                            <Text style={styles.todayGridValue}>
                                {rewards.today_level_bonus_reward} ENT
                            </Text>
                            <Text style={styles.todayGridLabel}>
                                {t("miningMy.dividendEarnings", {
                                    defaultValue: "Today Accumulated contributions",
                                })}
                            </Text>
                        </View>

                        <View style={styles.todayGridItem}>
                            <Text style={styles.todayGridValue}>
                                {t("vipMining.comingSoon", { defaultValue: "Coming soon" })}
                            </Text>
                            <Text style={styles.todayGridLabel}>
                                {t("miningMy.destructionEarnings", {
                                    defaultValue: "Today Cumulative destruction income",
                                })}
                            </Text>
                        </View>

                        <View style={styles.todayGridItem}>
                            <Text style={styles.todayGridValue}>
                                {rewards.today_total_reward} ENT
                            </Text>
                            <Text style={styles.todayGridLabel}>
                                {t("miningMy.totalMined", { defaultValue: "Today Total Revenue" })}
                            </Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.footerTip}>
                    {t("miningMy.releaseInfo", {
                        defaultValue:
                            "A total of 6 billion ENT Mining Machines were built, 20% is released in the first year, with a 20% annual decrease thereafter",
                    })}
                </Text>
            </View>

            {loading ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="small" color={themeColors.primary} />
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    // VIP Mining 页面容器
    page: {
        gap: 16,
    },
    // 顶部矿机信息卡片
    heroCard: {
        marginTop: 6,
        minHeight: 124,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.18)",
        backgroundColor: "rgba(255,255,255,0.06)",
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: "row",
        gap: 12,
    },
    // 左侧海报容器
    heroPoster: {
        width: 94,
        height: 104,
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
    },
    // 左侧海报图片
    heroPosterImage: {
        width: "100%",
        height: "100%",
    },
    // 海报角标容器
    heroBadge: {
        position: "absolute",
        top: 0,
        right: 0,
        width: 26,
        height: 26,
        borderBottomLeftRadius: 12,
        backgroundColor: "rgba(255,255,255,0.5)",
        alignItems: "center",
        justifyContent: "center",
    },
    // 海报角标图标
    heroBadgeIcon: {
        width: 16,
        height: 16,
    },
    // 右侧内容区域
    heroContent: {
        flex: 1,
        gap: 8,
    },
    // 顶部等级行
    heroTitleRow: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 5,
    },
    // VIP 等级文字
    heroLevelText: {
        color: "#ea82ff",
        fontSize: 18,
        fontWeight: "700",
    },
    // 节点数文字
    heroNodesText: {
        color: "#ea82ff",
        fontSize: 12,
        fontWeight: "700",
    },
    // 顶部底部操作行
    heroBottomRow: {
        marginTop: 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    // 顶部底部副文案
    heroSubText: {
        color: "#ffffff",
        fontSize: 12,
        fontWeight: "700",
    },
    // 购买 VIP 按钮
    buyVipButton: {
        borderRadius: 999,
        backgroundColor: themeColors.primary,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    // 购买 VIP 按钮文字
    buyVipButtonText: {
        color: "#ffffff",
        fontSize: 12,
        fontWeight: "700",
    },
    // 进度条模块容器
    progressWrap: {
        gap: 3,
    },
    // 进度条头部行
    progressTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    // 进度条标签文字
    progressLabel: {
        color: "rgba(255,255,255,0.9)",
        fontSize: 12,
    },
    // 进度条值文字
    progressValueLabel: {
        color: "#ffffff",
        fontSize: 12,
        fontWeight: "700",
    },
    // 进度条轨道
    progressTrack: {
        height: 6,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.2)",
        overflow: "hidden",
    },
    // 进度条填充
    progressFill: {
        height: "100%",
        backgroundColor: themeColors.primary,
    },
    // 通用区块容器
    section: {
        gap: 10,
    },
    // 区块标题
    sectionTitle: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "700",
    },
    // 数据卡片容器
    dataCard: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        backgroundColor: "rgba(153,153,153,0.12)",
        paddingHorizontal: 12,
        paddingVertical: 12,
        gap: 8,
        overflow: "hidden",
    },
    // 数据卡片背景图
    dataCardBg: {
        position: "absolute",
        right: 0,
        top: 0,
        width: 130,
        height: 130,
        opacity: 0.52,
    },
    // 数据行
    dataRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    // 数据标签
    dataLabel: {
        color: "#ffffff",
        fontSize: 14,
    },
    // 数据值
    dataValue: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "700",
    },
    // 今日收益卡片
    todayCard: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(157,254,242,0.22)",
        backgroundColor: "rgba(255,255,255,0.04)",
        padding: 10,
        gap: 10,
    },
    // 今日收益顶部行
    todayTopRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    // 今日收益图标
    todayIcon: {
        width: 50,
        height: 50,
    },
    // 今日收益顶部文字区
    todayTopTextWrap: {
        flex: 1,
        gap: 2,
    },
    // 今日收益主值
    todayMainValue: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "700",
    },
    // 今日收益副值
    todaySubValue: {
        color: "#ea82ff",
        fontSize: 12,
        fontWeight: "700",
    },
    // 今日收益提示文案
    todayTip: {
        color: "rgba(255,255,255,0.65)",
        fontSize: 12,
    },
    // 今日收益网格
    todayGrid: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(224,208,250,0.2)",
        overflow: "hidden",
        flexDirection: "row",
        flexWrap: "wrap",
    },
    // 今日收益网格项
    todayGridItem: {
        width: "50%",
        minHeight: 84,
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 8,
        gap: 3,
    },
    // 今日收益网格值
    todayGridValue: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "700",
        textAlign: "center",
    },
    // 今日收益网格标签
    todayGridLabel: {
        color: "rgba(255,255,255,0.65)",
        fontSize: 12,
        textAlign: "center",
    },
    // 底部说明文案
    footerTip: {
        color: "rgba(255,255,255,0.65)",
        fontSize: 12,
        lineHeight: 18,
    },
    // 加载态区域
    loadingWrap: {
        alignItems: "center",
        paddingVertical: 6,
    },
});
