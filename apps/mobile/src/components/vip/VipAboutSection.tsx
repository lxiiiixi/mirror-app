import { images } from "@mirror/assets";
import { ROUTE_PATHS } from "@mirror/routes";
import { MIRROR_EXTERNAL_LINKS } from "@mirror/utils";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { themeColors } from "../../theme/colors";
import { toImageSource } from "../../utils/imageSource";

const VIP_RULES_DATA = [
    { vip: "1", gift: "1", add: "0" },
    { vip: "2", gift: "3", add: "0" },
    { vip: "5", gift: "5", add: "0" },
    { vip: "10", gift: "10", add: "0" },
    { vip: "20", gift: "20", add: "2" },
    { vip: "30", gift: "30", add: "4" },
    { vip: "40", gift: "40", add: "5" },
    { vip: "50", gift: "50", add: "7" },
    { vip: "100", gift: "100", add: "15" },
];

const resolveWhitePaperLink = (language: string) => {
    const whitePaperLinks = MIRROR_EXTERNAL_LINKS.whitePaper as Record<string, string>;
    const normalized = language.toLowerCase();
    if (normalized.startsWith("zh-hk") || normalized.includes("hant")) {
        return whitePaperLinks.zh_hk ?? whitePaperLinks.en ?? "";
    }
    if (normalized.startsWith("zh")) {
        return whitePaperLinks.zh_cn ?? whitePaperLinks.en ?? "";
    }
    return whitePaperLinks.en ?? whitePaperLinks.zh_hk ?? whitePaperLinks.zh_cn ?? "";
};

export function VipAboutSection() {
    const { t, i18n } = useTranslation();
    const router = useRouter();

    const whitePaperLink = useMemo(() => {
        return resolveWhitePaperLink(i18n.resolvedLanguage ?? i18n.language ?? "en");
    }, [i18n.language, i18n.resolvedLanguage]);

    const benefitItems = [
        {
            title: t("vipAbout.newbieWhite", { defaultValue: "Newbie White:" }),
            desc: t("vipAbout.newbieWhiteDesc", {
                defaultValue: "Online clubs, RWA rewards and activities",
            }),
        },
        {
            title: t("vipAbout.potentialPlayers", { defaultValue: "Potential Players:" }),
            desc: t("vipAbout.potentialPlayersDesc", {
                defaultValue: "Early access to products and white list",
            }),
        },
        {
            title: t("vipAbout.trendsetters", { defaultValue: "Trendsetters:" }),
            desc: t("vipAbout.trendsettersDesc", {
                defaultValue: "Offline DAO, voting on key decisions",
            }),
        },
        {
            title: t("vipAbout.industryKOC", { defaultValue: "Industry KOC:" }),
            desc: t("vipAbout.industryKOCDesc", {
                defaultValue: "Share profits based on mining machine holdings",
            }),
        },
        {
            title: t("vipAbout.topOGs", { defaultValue: "Top OGs:" }),
            desc: t("vipAbout.topOGsDesc", {
                defaultValue: "Priority access to 3-year RWA investment",
            }),
        },
    ];

    const openExternalUrl = async (url: string) => {
        if (!url) return;
        await Linking.openURL(url);
    };

    return (
        <View style={styles.page}>
            <View style={styles.linkRow}>
                <Pressable
                    style={styles.whitePaperButton}
                    onPress={() => void openExternalUrl(whitePaperLink)}
                >
                    <Image
                        source={toImageSource(images.vip.whitePaperIcon)}
                        style={styles.whitePaperIcon}
                        resizeMode="contain"
                    />
                    <Text style={styles.whitePaperText}>
                        {t("vipAbout.whitePaper", { defaultValue: "white paper" })}
                    </Text>
                </Pressable>

                <View style={styles.socialRow}>
                    <Pressable
                        style={styles.socialButton}
                        onPress={() => void openExternalUrl(MIRROR_EXTERNAL_LINKS.discord)}
                    >
                        <Image
                            source={toImageSource(images.vip.discord)}
                            style={styles.socialIcon}
                            resizeMode="contain"
                        />
                        <Text style={styles.socialButtonText}>Discord</Text>
                    </Pressable>

                    <Pressable
                        style={styles.socialButton}
                        onPress={() => void openExternalUrl(MIRROR_EXTERNAL_LINKS.twitter)}
                    >
                        <Image
                            source={toImageSource(images.vip.x)}
                            style={styles.socialIcon}
                            resizeMode="contain"
                        />
                    </Pressable>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>
                    {t("vipAbout.cardTitle", { defaultValue: "EntertainFl Club VIP Privileges" })}
                </Text>

                <View style={styles.benefitList}>
                    {benefitItems.map(item => (
                        <View key={item.title} style={styles.benefitItem}>
                            <Text style={styles.benefitTitle}>
                                {item.title} <Text style={styles.benefitDesc}>{item.desc}</Text>
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={styles.joinCard}>
                    <Text style={styles.joinTitle}>
                        {t("vipAbout.joinTitle", {
                            defaultValue: "Join club receive mining machine",
                        })}
                    </Text>

                    <Pressable
                        style={styles.joinButton}
                        onPress={() => router.push(ROUTE_PATHS.vipPurchase)}
                    >
                        <Text style={styles.joinButtonText}>
                            {t("vipAbout.payButton", { defaultValue: "Pay 1000 USDT to join VIP" })}
                        </Text>
                    </Pressable>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>
                    {t("vipAbout.giftedNodes", { defaultValue: "Gifted mining machine" })}
                </Text>
                <Text style={styles.subLabel}>
                    {t("vipAbout.totalMiningCapacity", { defaultValue: "Total mining capacity" })}
                </Text>
                <Text style={styles.bigNumber}>6,000,000,000 ENT</Text>
                <Text style={styles.subLabel}>
                    {t("vipAbout.currentLimit", {
                        defaultValue: "Currently, there is a limit of 4000.",
                    })}
                </Text>

                <View style={styles.logoWrap}>
                    <Image
                        source={toImageSource(images.logo)}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.miningInfoList}>
                    <Text style={styles.miningInfoText}>
                        {t("vipAbout.dailyOutputPerNode", {
                            defaultValue: "Daily output per mining machine: 833 ENT",
                        })}
                    </Text>
                    <Text style={styles.miningInfoText}>
                        {t("vipAbout.acceleratedRelease", {
                            defaultValue: "Accelerated release: 35%",
                        })}
                    </Text>
                    <Text style={styles.miningInfoText}>
                        {t("vipAbout.oneVipGiftNode", { defaultValue: "1 VP gift node: 1" })}
                    </Text>
                    <Text style={styles.miningInfoText}>
                        {t("vipAbout.twentyVipGiftNodes", {
                            defaultValue: "20 VP gift mining machine: 20 +2",
                        })}
                    </Text>
                </View>

                <View style={styles.tableWrap}>
                    <View style={styles.tableHeaderRow}>
                        <Text style={styles.tableHeaderText}>
                            {t("vipAbout.tableHeaders.vips", { defaultValue: "VIPS" })}
                        </Text>
                        <Text style={styles.tableHeaderText}>
                            {t("vipAbout.tableHeaders.giftedNodes", {
                                defaultValue: "Gifted mining machine",
                            })}
                        </Text>
                        <Text style={styles.tableHeaderText}>
                            {t("vipAbout.tableHeaders.additionalNodes", {
                                defaultValue: "Additional mining machine",
                            })}
                        </Text>
                    </View>

                    {VIP_RULES_DATA.map(row => (
                        <View key={`vip-table-${row.vip}`} style={styles.tableRow}>
                            <Text style={styles.tableCellText}>{row.vip}</Text>
                            <Text style={styles.tableCellText}>{row.gift}</Text>
                            <Text style={styles.tableCellText}>{row.add}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    // VIP About 页面容器
    page: {
        gap: 16,
        paddingBottom: 4,
    },
    // 顶部链接行
    linkRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    // 白皮书按钮
    whitePaperButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    // 白皮书图标
    whitePaperIcon: {
        width: 18,
        height: 18,
    },
    // 白皮书文案
    whitePaperText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "700",
    },
    // 社媒按钮行
    socialRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    // 社媒按钮
    socialButton: {
        height: 24,
        borderRadius: 6,
        backgroundColor: themeColors.primary,
        paddingHorizontal: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    // 社媒图标
    socialIcon: {
        width: 14,
        height: 14,
    },
    // 社媒按钮文字
    socialButtonText: {
        color: "#ffffff",
        fontSize: 12,
        fontWeight: "700",
    },
    // 内容卡片
    card: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.18)",
        backgroundColor: "rgba(255,255,255,0.06)",
        paddingHorizontal: 14,
        paddingVertical: 16,
        gap: 12,
    },
    // 卡片主标题
    cardTitle: {
        color: "#ffffff",
        fontSize: 19,
        lineHeight: 24,
        fontWeight: "700",
        textAlign: "center",
    },
    benefitList: {
        gap: 9,
        paddingHorizontal: "10%",
        paddingVertical: 8,
    },
    benefitItem: {
        alignSelf: "stretch",
        alignItems: "center",
    },
    benefitTitle: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "700",
        textAlign: "center",
    },
    // 权益描述
    benefitDesc: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 14,
        textAlign: "center",
    },
    // 加入卡片
    joinCard: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(175,88,183,0.6)",
        backgroundColor: "rgba(255,255,255,0.04)",
        paddingHorizontal: 14,
        paddingVertical: 12,
        alignItems: "center",
        gap: 10,
    },
    // 加入标题
    joinTitle: {
        color: "#e7cbfb",
        fontSize: 24,
        lineHeight: 28,
        fontWeight: "700",
        textAlign: "center",
    },
    // 加入按钮
    joinButton: {
        borderRadius: 8,
        backgroundColor: themeColors.primary,
        paddingHorizontal: 14,
        paddingVertical: 7,
    },
    // 加入按钮文字
    joinButtonText: {
        color: "#ffffff",
        fontSize: 13,
        fontWeight: "700",
    },
    // 副标题文本
    subLabel: {
        color: "rgba(255,255,255,0.9)",
        fontSize: 13,
        textAlign: "center",
    },
    // 大数字文本
    bigNumber: {
        color: "#37FFC6",
        fontSize: 27,
        fontWeight: "700",
        textAlign: "center",
    },
    // logo 区域
    logoWrap: {
        alignItems: "center",
        marginVertical: 4,
    },
    // logo 图片
    logo: {
        width: 132,
        height: 44,
    },
    // 矿机信息列表
    miningInfoList: {
        gap: 5,
    },
    // 矿机信息文本
    miningInfoText: {
        color: "#9996A9",
        fontSize: 14,
        textAlign: "center",
    },
    // 规则表容器
    tableWrap: {
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: "#2b2c3c",
    },
    // 规则表头行
    tableHeaderRow: {
        height: 34,
        backgroundColor: "#3f415e",
        flexDirection: "row",
        alignItems: "center",
    },
    // 规则表头文字
    tableHeaderText: {
        flex: 1,
        color: "#ffffff",
        fontSize: 12,
        textAlign: "center",
    },
    // 规则表内容行
    tableRow: {
        minHeight: 29,
        borderTopWidth: 1,
        borderTopColor: "#3f415e",
        flexDirection: "row",
        alignItems: "center",
    },
    // 规则表单元格文字
    tableCellText: {
        flex: 1,
        color: "rgba(255,255,255,0.82)",
        fontSize: 13,
        textAlign: "center",
    },
});
