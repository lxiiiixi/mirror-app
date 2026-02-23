import { images } from "@mirror/assets";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { toImageSource } from "../../utils/imageSource";

const DISCOVER_PIC_KEYS = ["d1", "d2", "d3"] as const;
const DISCOVER_PIC_KEYS_CN = ["d1Cn", "d2Cn", "d3Cn"] as const;
const DEFAULT_TIME_LIST = ["2025.06.30", "2025.03.26", "2024.06.23"] as const;
const DISCOVER_ASPECT_RATIO: Record<(typeof DISCOVER_PIC_KEYS)[number], number> = {
    d1: 750 / 440,
    d2: 750 / 440,
    d3: 790 / 480,
};
const DISCOVER_ASPECT_RATIO_CN: Record<(typeof DISCOVER_PIC_KEYS_CN)[number], number> = {
    d1Cn: 750 / 480,
    d2Cn: 750 / 440,
    d3Cn: 750 / 480,
};

interface NewsItem {
    content: string;
    time: string;
}

export interface PromotionDiscoverProps {
    onNewsPress?: () => void;
}

export function PromotionDiscover({ onNewsPress }: PromotionDiscoverProps) {
    const { t, i18n } = useTranslation();

    const newsList = useMemo<NewsItem[]>(() => {
        const raw = t("newsData", { returnObjects: true });
        if (!Array.isArray(raw)) {
            return [];
        }

        return raw.map((item, index) => {
            const content =
                item && typeof item === "object" && "content" in item
                    ? String(item.content ?? "")
                    : "";

            return {
                content,
                time: DEFAULT_TIME_LIST[index] ?? DEFAULT_TIME_LIST[DEFAULT_TIME_LIST.length - 1],
            };
        });
    }, [t]);

    const resolveNewsPic = useMemo(() => {
        const isZh = (i18n.resolvedLanguage ?? i18n.language ?? "en").startsWith("zh");

        return (index: number) => {
            if (isZh) {
                const key = DISCOVER_PIC_KEYS_CN[index];
                return {
                    source: key ? images.discover[key] : undefined,
                    ratio: key ? DISCOVER_ASPECT_RATIO_CN[key] : 750 / 440,
                };
            }

            const key = DISCOVER_PIC_KEYS[index];
            return {
                source: key ? images.discover[key] : undefined,
                ratio: key ? DISCOVER_ASPECT_RATIO[key] : 750 / 440,
            };
        };
    }, [i18n.language, i18n.resolvedLanguage]);

    return (
        <View style={styles.list}>
            {newsList.map((item, index) => {
                const newsImage = resolveNewsPic(index);
                const newsImageSource = toImageSource(newsImage.source);

                return (
                    <View key={`discover-${index}`} style={styles.newsItem}>
                        <View style={styles.userRow}>
                            <View style={styles.userAvatar}>
                                <Image
                                    source={toImageSource(images.discover.userHead)}
                                    style={styles.userAvatarImage}
                                    resizeMode="cover"
                                />
                            </View>

                            <Text style={styles.userName}>Mirror</Text>

                            <Image
                                source={toImageSource(images.discover.auth)}
                                style={styles.authIcon}
                                resizeMode="contain"
                            />
                        </View>

                        <Pressable style={styles.newsPicButton} onPress={onNewsPress}>
                            <Image
                                source={newsImageSource}
                                style={[styles.newsPic, { aspectRatio: newsImage.ratio }]}
                                resizeMode="cover"
                            />
                        </Pressable>

                        <Text style={styles.newsContent}>{item.content}</Text>
                        <Text style={styles.newsTime}>{item.time}</Text>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    // 发现列表容器
    list: {
        width: "100%",
        alignSelf: "stretch",
        gap: 16,
    },
    // 单条新闻卡片
    newsItem: {
        width: "100%",
        alignSelf: "stretch",
        gap: 6,
    },
    // 用户信息行
    userRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    // 用户头像容器
    userAvatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        overflow: "hidden",
        marginRight: 8,
    },
    // 用户头像图片
    userAvatarImage: {
        width: "100%",
        height: "100%",
    },
    // 用户名称文字
    userName: {
        color: "#ffffff",
        fontSize: 14,
        lineHeight: 20,
        fontWeight: "500",
        marginRight: 6,
    },
    // 认证图标
    authIcon: {
        width: 15,
        height: 15,
    },
    // 新闻图按钮容器
    newsPicButton: {
        // width: "100%",
        // maxWidth: "100%",
        // alignSelf: "stretch",
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: "transparent",
    },
    // 新闻图图片
    newsPic: {
        width: "100%",
        maxWidth: "100%",
    },
    // 新闻正文
    newsContent: {
        color: "#ffffff",
        fontSize: 15,
        lineHeight: 19,
    },
    // 新闻时间
    newsTime: {
        color: "#999999",
        fontSize: 11,
        lineHeight: 12,
    },
});
