import { images } from "@mirror/assets";
import { formatNumber } from "@mirror/utils";
import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
    type StyleProp,
    type ViewStyle,
} from "react-native";
import { themeColors } from "../../theme/colors";
import { toImageSource } from "../../utils/imageSource";

export interface PromotionInviteNum {
    direct_invites: string;
    indirect_invites: string;
}

export interface PromotionCommunityCardProps {
    inviteUrl: string;
    inviteNum: PromotionInviteNum;
    savingPoster?: boolean;
    onSavePosterPress?: () => void;
    onShareLinkPress?: () => void;
}

export interface PromotionCommissionCardProps {
    today: string;
    total: string;
}

function GlassPanel({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
    try {
        const maybeExpoBlur = require("expo-blur");
        if (maybeExpoBlur?.BlurView) {
            const BlurViewComponent = maybeExpoBlur.BlurView as React.ComponentType<{
                intensity?: number;
                tint?: "light" | "dark" | "default" | string;
                style?: StyleProp<ViewStyle>;
                children?: ReactNode;
            }>;

            return (
                <BlurViewComponent intensity={36} tint="dark" style={[styles.glassPanel, style]}>
                    {children}
                </BlurViewComponent>
            );
        }
    } catch {
        // ignore and fallback to non-blur panel
    }

    return <View style={[styles.glassPanel, styles.glassPanelFallback, style]}>{children}</View>;
}

const getInviteCodeFromUrl = (url: string) => {
    if (!url) {
        return "";
    }

    const matched = /[?&]club_invite=([^&]+)/i.exec(url);
    if (!matched?.[1]) {
        return "";
    }

    try {
        return decodeURIComponent(matched[1]);
    } catch {
        return matched[1];
    }
};

export function PromotionCommunityCard({
    inviteUrl,
    inviteNum,
    savingPoster = false,
    onSavePosterPress,
    onShareLinkPress,
}: PromotionCommunityCardProps) {
    const { t } = useTranslation();
    const inviteCode = getInviteCodeFromUrl(inviteUrl);

    return (
        <GlassPanel style={styles.contentCard}>
            <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitleText}>
                    {t("promotion.promotion", { defaultValue: "Community" })}
                </Text>

                <View style={styles.inviteStatsWrap}>
                    <Text style={styles.inviteStatsText}>
                        {t("promotion.directCommission", { defaultValue: "Direct commission 10%:" })}{" "}
                        {inviteNum.direct_invites}
                    </Text>
                    <Text style={styles.inviteStatsText}>
                        {t("promotion.indirectCommission", {
                            defaultValue: "Indirect commission 5%:",
                        })}{" "}
                        {inviteNum.indirect_invites}
                    </Text>
                </View>
            </View>

            <View style={styles.shareBox}>
                <View style={styles.sharePreviewWrap}>
                    <Image
                        source={toImageSource(images.images.qrcodeBg)}
                        style={styles.sharePreviewBackground}
                        resizeMode="cover"
                    />
                    <View style={styles.sharePreviewMask} />

                    <View style={styles.sharePreviewContent}>
                        <Image
                            source={toImageSource(images.vip.shareLogo)}
                            style={styles.shareLogo}
                            resizeMode="contain"
                        />

                        <View style={styles.qrPlaceholder}>
                            <Text style={styles.qrPlaceholderText} numberOfLines={1}>
                                {inviteCode || "MIRROR"}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.shareButtonsWrap}>
                    <Pressable style={styles.actionButton} onPress={onSavePosterPress}>
                        <Text style={styles.actionButtonText}>
                            {savingPoster
                                ? t("miningShare.generating", { defaultValue: "Generating..." })
                                : t("miningShare.savePoster", { defaultValue: "Save Poster" })}
                        </Text>
                    </Pressable>

                    <Pressable style={styles.actionButton} onPress={onShareLinkPress}>
                        <Text style={styles.actionButtonText}>
                            {t("miningShare.shareLink", { defaultValue: "Share Link" })}
                        </Text>
                    </Pressable>
                </View>
            </View>
        </GlassPanel>
    );
}

export function PromotionCommissionCard({ today, total }: PromotionCommissionCardProps) {
    const { t } = useTranslation();

    return (
        <GlassPanel style={[styles.contentCard, styles.statsCard]}>
            <View style={styles.statsCol}>
                <Text style={styles.statsLabel}>
                    {t("promotion.todaysCommission", { defaultValue: "Today's commission" })}
                </Text>
                <Text style={styles.statsValue}>{formatNumber(today)}</Text>
            </View>

            <View style={styles.statsCol}>
                <Text style={styles.statsLabel}>
                    {t("promotion.cumulativeCommission", { defaultValue: "Cumulative commission" })}
                </Text>
                <Text style={styles.statsValue}>${formatNumber(total)}</Text>
            </View>
        </GlassPanel>
    );
}

const styles = StyleSheet.create({
    // 玻璃面板基础样式
    glassPanel: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.18)",
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        overflow: "hidden",
    },
    // 玻璃面板降级背景
    glassPanelFallback: {
        backgroundColor: "rgba(33, 26, 76, 0.82)",
    },
    // 内容卡片容器
    contentCard: {
        width: "100%",
        alignSelf: "stretch",
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    // 卡片标题行
    cardTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    // 卡片标题文字
    cardTitleText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "700",
    },
    // 邀请统计区域
    inviteStatsWrap: {
        alignItems: "flex-end",
        gap: 2,
    },
    // 邀请统计文字
    inviteStatsText: {
        color: "#ffffff",
        fontSize: 12,
        lineHeight: 17,
    },
    // 分享信息主容器
    shareBox: {
        marginTop: 12,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 16,
    },
    // 左侧分享预览容器
    sharePreviewWrap: {
        flex: 1,
        maxWidth: 182,
        minWidth: 120,
        height: 112,
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
    },
    // 左侧分享预览背景图
    sharePreviewBackground: {
        ...StyleSheet.absoluteFillObject,
    },
    // 左侧分享预览遮罩
    sharePreviewMask: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.82)",
    },
    // 左侧分享预览内容层
    sharePreviewContent: {
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingHorizontal: 10,
    },
    // 品牌 logo 图片
    shareLogo: {
        width: 80,
        height: 18,
    },
    // 邀请码占位框
    qrPlaceholder: {
        minWidth: 84,
        maxWidth: 158,
        height: 34,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.55)",
        backgroundColor: "rgba(255,255,255,0.14)",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 8,
    },
    // 邀请码占位文字
    qrPlaceholderText: {
        color: "#ffffff",
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 0.25,
    },
    // 右侧按钮区域
    shareButtonsWrap: {
        width: 120,
        flexShrink: 0,
        alignItems: "flex-end",
        gap: 12,
    },
    // 操作按钮样式
    actionButton: {
        width: "100%",
        height: 34,
        borderRadius: 8,
        backgroundColor: themeColors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    // 操作按钮文字
    actionButtonText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
    },
    // 佣金卡片布局
    statsCard: {
        flexDirection: "row",
        gap: 12,
    },
    // 佣金单列容器
    statsCol: {
        flex: 1,
    },
    // 佣金标题文字
    statsLabel: {
        color: "#ffffff",
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 6,
    },
    // 佣金数值文字
    statsValue: {
        color: "#ff9d00",
        fontSize: 26,
        fontWeight: "700",
    },
});
