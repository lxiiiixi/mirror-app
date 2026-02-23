import type { NodeInviteRecordItem } from "@mirror/api";
import { images } from "@mirror/assets";
import { formatAmount, formatDate, formatEnt, formatShortAddress } from "@mirror/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { artsApiClient } from "../../api/artsClient";
import { useAuth } from "../../hooks/useAuth";
import { themeColors } from "../../theme/colors";
import { toImageSource } from "../../utils/imageSource";

type RewardsState = {
    total_base_mining_reward: number;
    total_invite_reward: number;
    total_level_bonus_reward: number;
    total_total_reward: number;
};

const INVITE_LEVEL_IMAGES = [
    images.mining.inviteLevel1,
    images.mining.inviteLevel2,
    images.mining.inviteLevel3,
    images.mining.inviteLevel4,
    images.mining.inviteLevel5,
] as const;

/** 根据层级 (1–5) 取对应等级图标，超出范围取首尾 */
function getInviteLevelImage(level: number) {
    const index = Math.min(4, Math.max(0, level - 1));
    return INVITE_LEVEL_IMAGES[index];
}

/** 邀请列表内地址展示：前3位 + *** + 后4位 */
const formatAddress = (address?: string | number) => formatShortAddress(address, 3, 4, "***");

interface InviteTreeItemProps {
    item: NodeInviteRecordItem;
    depth?: number;
}

function InviteTreeItem({ item, depth = 0 }: InviteTreeItemProps) {
    const [open, setOpen] = useState(false);
    const hasChildren = Array.isArray(item.sub_invites) && item.sub_invites.length > 0;
    const level = item.level ?? depth + 1;
    const reward = item.total_amount ?? 0;
    const time = item.time ?? item.node_create_time ?? "";
    const arrowIcon = hasChildren ? images.mining.inviteArrowDown : images.mining.inviteArrowRight;

    return (
        <View style={[styles.treeCard, { marginLeft: depth > 0 ? 12 : 0 }]}>
            <Pressable
                style={styles.treeHeader}
                onPress={() => {
                    if (hasChildren) {
                        setOpen(prev => !prev);
                    }
                }}
            >
                <View style={styles.treeHeaderLeft}>
                    <Image
                        source={toImageSource(arrowIcon)}
                        style={styles.arrowIcon}
                        resizeMode="contain"
                    />

                    <View style={styles.treeMainInfo}>
                        <Image
                            source={toImageSource(getInviteLevelImage(level))}
                            style={styles.levelIcon}
                            resizeMode="contain"
                        />

                        <View style={styles.walletRow}>
                            <Image
                                source={toImageSource(images.network.sol)}
                                style={styles.walletChainIcon}
                                resizeMode="contain"
                            />
                            <Text style={styles.walletText}>{formatAddress(item.address)}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.treeRewardWrap}>
                    <Text style={styles.treeRewardText}>+ {formatAmount(reward)} U</Text>
                    <Text style={styles.treeTimeText}>{formatDate(time)}</Text>
                </View>
            </Pressable>

            {open && hasChildren ? (
                <View style={styles.childrenWrap}>
                    {item.sub_invites.map((child, index) => (
                        <InviteTreeItem
                            key={`${item.level}-${item.address ?? "node"}-${child.address ?? index}`}
                            item={child}
                            depth={depth + 1}
                        />
                    ))}
                </View>
            ) : null}
        </View>
    );
}

export function VipNodeSection() {
    const { t } = useTranslation();
    const { isLoggedIn } = useAuth();

    const [inviteNum, setInviteNum] = useState({
        direct_invites: "0/0",
        indirect_invites: "0/0",
    });
    const [inviteList, setInviteList] = useState<NodeInviteRecordItem[]>([]);
    const [rewards, setRewards] = useState<RewardsState>({
        total_base_mining_reward: 0,
        total_invite_reward: 0,
        total_level_bonus_reward: 0,
        total_total_reward: 0,
    });
    const [loading, setLoading] = useState(false);

    const fetchVipNodeData = useCallback(async () => {
        if (!isLoggedIn) {
            setInviteList([]);
            setInviteNum({
                direct_invites: "0/0",
                indirect_invites: "0/0",
            });
            setRewards({
                total_base_mining_reward: 0,
                total_invite_reward: 0,
                total_level_bonus_reward: 0,
                total_total_reward: 0,
            });
            return;
        }

        setLoading(true);
        try {
            const [levelResponse, inviteResponse, rewardsResponse] = await Promise.all([
                artsApiClient.user.getLevelProgress(),
                artsApiClient.node.getInviteRecords(),
                artsApiClient.node.mining.getRewards(),
            ]);

            const levelData = levelResponse.data;
            setInviteNum({
                direct_invites: String(levelData?.direct_invites ?? "0/0"),
                indirect_invites: String(levelData?.indirect_invites ?? "0/0"),
            });

            const inviteData = inviteResponse.data;
            setInviteList(Array.isArray(inviteData?.level_list) ? inviteData.level_list : []);

            const rewardsInfo = rewardsResponse.data?.rewards_info;
            const totalCycle = rewardsInfo?.total_cycle_rewards;
            setRewards({
                total_base_mining_reward: formatEnt(totalCycle?.base_mining_reward),
                total_invite_reward: formatEnt(totalCycle?.invite_reward),
                total_level_bonus_reward: formatEnt(totalCycle?.level_bonus_reward),
                total_total_reward: formatEnt(totalCycle?.total_reward),
            });
        } catch (error) {
            console.error("[VipNodeSection] load failed", error);
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        void fetchVipNodeData();
    }, [fetchVipNodeData]);

    const hasInvites = useMemo(() => inviteList.length > 0, [inviteList.length]);

    return (
        <View style={styles.page}>
            <Text style={styles.totalTitle}>
                {t("totalRevenue.entTotalRevenue", {
                    defaultValue: "Accumulated coin production income",
                })}{" "}
                <Text style={styles.totalTitleStrong}>{rewards.total_total_reward} ENT</Text>
            </Text>

            <View style={styles.overviewCard}>
                <View style={styles.overviewGrid}>
                    <View style={styles.overviewItem}>
                        <Text style={styles.overviewValue}>
                            {rewards.total_base_mining_reward} ENT
                        </Text>
                        <Text style={styles.overviewLabel}>
                            {t("totalRevenue.dailyRevenue", {
                                defaultValue: "Accumulated community benefits",
                            })}
                        </Text>
                    </View>
                    <View style={styles.overviewItem}>
                        <Text style={styles.overviewValue}>
                            {rewards.total_level_bonus_reward} ENT
                        </Text>
                        <Text style={styles.overviewLabel}>
                            {t("totalRevenue.teamRevenue", {
                                defaultValue: "Cumulative's Contribution",
                            })}
                        </Text>
                    </View>
                    <View style={styles.overviewItem}>
                        <Text style={styles.overviewValue}>0 ENT</Text>
                        <Text style={styles.overviewLabel}>
                            {t("totalRevenue.destructionRevenue", {
                                defaultValue: "Destroy Cumulative's profits",
                            })}
                        </Text>
                    </View>
                    <View style={styles.overviewItem}>
                        <Text style={styles.overviewValue}>{rewards.total_invite_reward} ENT</Text>
                        <Text style={styles.overviewLabel}>
                            {t("totalRevenue.directSalesRevenue", {
                                defaultValue: "Cumulative's Community benefits",
                            })}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.inviteHeaderWrap}>
                <View style={styles.inviteTitleRow}>
                    <Image source={toImageSource(images.mining.invite)} style={styles.inviteIcon} />
                    <Text style={styles.inviteTitle}>
                        {t("miningInvites.invites", { defaultValue: "Community Team" })}
                    </Text>
                </View>

                <View style={styles.inviteStatsRow}>
                    <View style={styles.inviteStatItem}>
                        <Text style={styles.inviteStatLabel}>
                            {t("miningInvites.level1", { defaultValue: "Direct:" })}
                        </Text>
                        <Text style={styles.inviteStatValue}>{inviteNum.direct_invites}</Text>
                    </View>

                    <View style={styles.inviteStatItem}>
                        <Text style={styles.inviteStatLabel}>
                            {t("miningInvites.level2", { defaultValue: "Delay:" })}
                        </Text>
                        <Text style={styles.inviteStatValue}>{inviteNum.indirect_invites}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.treeWrap}>
                {hasInvites ? (
                    inviteList.map((item, index) => (
                        <InviteTreeItem
                            key={`${item.level}-${item.address ?? index}`}
                            item={item}
                        />
                    ))
                ) : (
                    <Text style={styles.emptyText}>
                        {t("ticket.empty", { defaultValue: "No items yet." })}
                    </Text>
                )}
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
    // VIP Node 页面容器
    page: {
        gap: 14,
    },
    // 顶部总收益标题
    totalTitle: {
        color: "#ffffff",
        fontSize: 18,
        lineHeight: 24,
        fontWeight: "700",
        textAlign: "center",
    },
    // 顶部总收益高亮文本
    totalTitleStrong: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "700",
    },
    // 总览卡片
    overviewCard: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
        backgroundColor: "rgba(255,255,255,0.06)",
        padding: 14,
    },
    // 总览网格
    overviewGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    // 总览网格项
    overviewItem: {
        width: "50%",
        minHeight: 70,
        paddingHorizontal: 3,
        paddingVertical: 6,
        justifyContent: "flex-start",
    },
    // 总览值文本
    overviewValue: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "700",
    },
    // 总览标签文本
    overviewLabel: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 12,
        marginTop: 2,
    },
    // 邀请头部区域
    inviteHeaderWrap: {
        gap: 8,
    },
    // 邀请标题行
    inviteTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    // 邀请标题图标
    inviteIcon: {
        width: 20,
        height: 20,
    },
    // 邀请标题文字
    inviteTitle: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "700",
    },
    // 邀请统计行
    inviteStatsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
    },
    // 邀请统计单项
    inviteStatItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    // 邀请统计标签
    inviteStatLabel: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 14,
    },
    // 邀请统计值
    inviteStatValue: {
        color: "#ffffff",
        fontSize: 14,
    },
    // 邀请树列表容器
    treeWrap: {
        gap: 10,
    },
    // 邀请树卡片
    treeCard: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
        backgroundColor: "rgba(255,255,255,0.06)",
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    // 邀请树头部按钮
    treeHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    // 邀请树头部左侧区域
    treeHeaderLeft: {
        flex: 1,
        minWidth: 0,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    // 箭头图标
    arrowIcon: {
        width: 20,
        height: 20,
    },
    // 树节点主信息容器
    treeMainInfo: {
        flex: 1,
        minWidth: 0,
        gap: 4,
    },
    // 等级图标
    levelIcon: {
        width: 20,
        height: 20,
    },
    // 钱包行
    walletRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    // 钱包链图标
    walletChainIcon: {
        width: 14,
        height: 14,
    },
    // 钱包地址文本
    walletText: {
        color: "rgba(255,255,255,0.9)",
        fontSize: 12,
        flexShrink: 1,
    },
    // 右侧收益区域
    treeRewardWrap: {
        alignItems: "flex-end",
        justifyContent: "center",
    },
    // 右侧收益文本
    treeRewardText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "700",
    },
    // 右侧时间文本
    treeTimeText: {
        color: "rgba(255,255,255,0.55)",
        fontSize: 11,
        marginTop: 2,
    },
    // 子节点容器
    childrenWrap: {
        marginTop: 8,
        gap: 8,
    },
    // 空态文本
    emptyText: {
        color: "rgba(255,255,255,0.62)",
        fontSize: 12,
        textAlign: "center",
        paddingVertical: 10,
    },
    // 加载态区域
    loadingWrap: {
        alignItems: "center",
        paddingVertical: 4,
    },
});
