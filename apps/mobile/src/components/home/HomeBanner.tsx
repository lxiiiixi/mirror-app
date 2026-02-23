import { images } from "@mirror/assets";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Image,
    Linking,
    PanResponder,
    Pressable,
    StyleSheet,
    View,
    type ImageSourcePropType,
    type LayoutChangeEvent,
} from "react-native";
import { toImageSource } from "../../utils/imageSource";

interface BannerLocaleItem {
    id?: string | number;
    img: string;
    link?: string;
    alt?: string;
}

interface HomeBannerItem {
    id: string | number;
    source: ImageSourcePropType;
    link: string | undefined;
    alt: string | undefined;
}

export interface HomeBannerProps {
    autoplay?: boolean;
    interval?: number;
}

const LOCALE_SUFFIXES = ["_cn", "_hk", "_en"] as const;
const bannerImageMap = images.banner as Record<string, string | number>;
const LEVEL = 2;
const SCALE_RATIO = 0.9;
const SCENE_MIN_HEIGHT = 140;
const SCENE_MAX_HEIGHT = 300;
const SCENE_HEIGHT_RATIO = 0.42;
const CARD_MIN_WIDTH = 220;
const CARD_MAX_WIDTH = 420;
const CARD_WIDTH_RATIO = 0.68;
const CARD_ASPECT_RATIO = 267 / 129;

function getBannerSlot(key: string) {
    for (const suffix of LOCALE_SUFFIXES) {
        if (key.endsWith(suffix)) {
            return key.slice(0, -suffix.length);
        }
    }
    return key;
}

function resolveBannerAsset(imgKey: string, language: string) {
    if (imgKey in bannerImageMap) {
        return bannerImageMap[imgKey];
    }

    const slot = getBannerSlot(imgKey);
    const langSuffix =
        language === "zh-CN"
            ? "_cn"
            : language === "zh-HK" || language === "zh-TW"
              ? "_hk"
              : "_en";

    const fallbackKeys = [
        slot + langSuffix,
        ...LOCALE_SUFFIXES.filter((s) => s !== langSuffix).map((s) => slot + s),
        slot,
    ];

    for (const key of fallbackKeys) {
        if (key in bannerImageMap) {
            return bannerImageMap[key];
        }
    }

    return undefined;
}

export function HomeBanner({ autoplay = true, interval = 4000 }: HomeBannerProps) {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const activeIndexRef = useRef(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);

    const banners = useMemo<HomeBannerItem[]>(() => {
        const raw = t("banners", { returnObjects: true }) as BannerLocaleItem[] | string;
        if (!Array.isArray(raw)) {
            return [];
        }

        const language = i18n.resolvedLanguage ?? i18n.language ?? "en";
        const mapped: Array<HomeBannerItem | null> = raw.map((item, index) => {
            const resolved = resolveBannerAsset(item.img, language);
            const source = toImageSource(resolved);
            if (!source) return null;

            return {
                id: item.id ?? index,
                source,
                link: item.link,
                alt: item.alt,
            };
        });

        return mapped.filter((item): item is HomeBannerItem => item !== null);
    }, [i18n.language, i18n.resolvedLanguage, t]);

    const stopAutoplay = useCallback(() => {
        if (!autoplayRef.current) {
            return;
        }
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
    }, []);

    const goToSlide = useCallback(
        (nextIndex: number) => {
            if (!banners.length) return;
            const normalized = (nextIndex + banners.length) % banners.length;
            activeIndexRef.current = normalized;
            setActiveIndex(normalized);
        },
        [banners.length],
    );

    const startAutoplay = useCallback(() => {
        if (!autoplay || banners.length <= 1) {
            return;
        }

        stopAutoplay();
        autoplayRef.current = setInterval(() => {
            goToSlide(activeIndexRef.current + 1);
        }, Math.max(1000, interval));
    }, [autoplay, banners.length, goToSlide, interval, stopAutoplay]);

    const resetAutoplay = useCallback(() => {
        stopAutoplay();
        startAutoplay();
    }, [startAutoplay, stopAutoplay]);

    useEffect(() => {
        startAutoplay();
        return () => {
            stopAutoplay();
        };
    }, [startAutoplay, stopAutoplay]);

    useEffect(() => {
        if (activeIndex > banners.length - 1) {
            goToSlide(0);
        }
    }, [activeIndex, banners.length, goToSlide]);

    useEffect(() => {
        activeIndexRef.current = activeIndex;
    }, [activeIndex]);

    const handleBannerPress = useCallback(
        async (link?: string) => {
            if (!link) return;
            if (/^https?:\/\//i.test(link)) {
                await Linking.openURL(link);
                return;
            }
            router.push(link as never);
        },
        [router],
    );

    const handleCardPress = useCallback(
        (index: number, link?: string) => {
            if (index === activeIndexRef.current) {
                void handleBannerPress(link);
                return;
            }
            goToSlide(index);
            resetAutoplay();
        },
        [goToSlide, handleBannerPress, resetAutoplay],
    );

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: () => false,
                onMoveShouldSetPanResponder: (_, gesture) =>
                    Math.abs(gesture.dx) > Math.abs(gesture.dy) && Math.abs(gesture.dx) > 8,
                onPanResponderGrant: () => {
                    stopAutoplay();
                },
                onPanResponderRelease: (_, gesture) => {
                    if (!banners.length) return;
                    const absDx = Math.abs(gesture.dx);
                    const absDy = Math.abs(gesture.dy);
                    if (absDx > 50 && absDx > absDy) {
                        if (gesture.dx > 0) {
                            goToSlide(activeIndexRef.current - 1);
                        } else {
                            goToSlide(activeIndexRef.current + 1);
                        }
                    }
                    startAutoplay();
                },
                onPanResponderTerminate: () => {
                    startAutoplay();
                },
            }),
        [banners.length, goToSlide, startAutoplay, stopAutoplay],
    );

    const handleLayout = (event: LayoutChangeEvent) => {
        const nextWidth = Math.floor(event.nativeEvent.layout.width);
        if (nextWidth > 0 && nextWidth !== containerWidth) {
            setContainerWidth(nextWidth);
        }
    };

    const sceneHeight = Math.min(
        SCENE_MAX_HEIGHT,
        Math.max(SCENE_MIN_HEIGHT, containerWidth * SCENE_HEIGHT_RATIO),
    );
    const cardWidth = Math.min(
        CARD_MAX_WIDTH,
        Math.max(CARD_MIN_WIDTH, containerWidth * CARD_WIDTH_RATIO),
    );
    const cardHeight = cardWidth / CARD_ASPECT_RATIO;

    const getCardVisual = useCallback(
        (index: number) => {
            const total = banners.length;
            const diff = (index - activeIndex + total) % total;

            if (diff === 0) {
                return {
                    offsetX: 0,
                    scale: 1.1,
                    opacity: 1,
                    zIndex: total + 2,
                    active: true,
                    visible: true,
                };
            }

            if (diff >= 1 && diff <= LEVEL) {
                const level = diff;
                const offsetMap: Record<number, number> = { 1: -53, 2: -75 };
                const opacityMap: Record<number, number> = { 1: 1, 2: 0.6 };
                return {
                    offsetX: offsetMap[level] ?? 0,
                    scale: Math.pow(SCALE_RATIO, level),
                    opacity: opacityMap[level] ?? 0,
                    zIndex: total - level,
                    active: false,
                    visible: true,
                };
            }

            if (diff >= total - LEVEL) {
                const level = total - diff;
                const offsetMap: Record<number, number> = { 1: 53, 2: 75 };
                const opacityMap: Record<number, number> = { 1: 1, 2: 0.6 };
                return {
                    offsetX: offsetMap[level] ?? 0,
                    scale: Math.pow(SCALE_RATIO, level),
                    opacity: opacityMap[level] ?? 0,
                    zIndex: total - level,
                    active: false,
                    visible: true,
                };
            }

            return {
                offsetX: 0,
                scale: 0.5,
                opacity: 0,
                zIndex: 0,
                active: false,
                visible: false,
            };
        },
        [activeIndex, banners.length],
    );

    if (!banners.length) {
        return null;
    }

    return (
        <View style={styles.root}>
            <View style={[styles.scene, { height: sceneHeight }]} onLayout={handleLayout} {...panResponder.panHandlers}>
                <View style={styles.sceneWrapper}>
                    {banners.map((item, index) => {
                        const visual = getCardVisual(index);
                        return (
                            <Pressable
                                key={item.id}
                                pointerEvents={visual.visible ? "auto" : "none"}
                                style={[
                                    styles.card,
                                    {
                                        width: cardWidth,
                                        height: cardHeight,
                                        opacity: visual.opacity,
                                        zIndex: visual.zIndex,
                                        transform: [
                                            { translateX: -cardWidth / 2 + visual.offsetX },
                                            { translateY: -cardHeight / 2 },
                                            { scale: visual.scale },
                                        ],
                                    },
                                    visual.active && styles.cardActive,
                                ]}
                                onPress={() => handleCardPress(index, item.link)}
                            >
                                <Image
                                    source={item.source}
                                    style={styles.image}
                                    resizeMode="cover"
                                    accessibilityLabel={item.alt}
                                />
                                <View
                                    style={[
                                        styles.cardOverlay,
                                        visual.active && styles.cardOverlayActive,
                                    ]}
                                />
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            {banners.length > 1 ? (
                <View style={styles.dots}>
                    {banners.map((item, index) => (
                        <Pressable
                            key={item.id}
                            style={[styles.dot, index === activeIndex && styles.dotActive]}
                            onPress={() => {
                                goToSlide(index);
                                resetAutoplay();
                            }}
                        />
                    ))}
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        width: "100%",
        gap: 8,
    },
    scene: {
        width: "100%",
        position: "relative",
    },
    sceneWrapper: {
        width: "100%",
        height: "100%",
        position: "relative",
    },
    card: {
        position: "absolute",
        left: "50%",
        top: "50%",
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,205,244,0.5)",
        backgroundColor: "rgba(255,255,255,0.08)",
    },
    cardActive: {
        borderColor: "rgba(255,205,244,0.8)",
        shadowColor: "rgba(0,0,0,1)",
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    image: {
        width: "100%",
        height: "100%",
    },
    cardOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.24)",
    },
    cardOverlayActive: {
        opacity: 0,
    },
    dots: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 4,
        backgroundColor: "rgba(153,153,153,0.5)",
    },
    dotActive: {
        width: 10,
        backgroundColor: "#ffffff",
        shadowColor: "rgba(235,20,132,1)",
        shadowOpacity: 0.4,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 0 },
        elevation: 2,
    },
});
