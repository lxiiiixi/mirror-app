import { images } from "@mirror/assets";
import { getWorkTypeInfo } from "@mirror/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    type LayoutChangeEvent,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
    type ScrollView as ScrollViewType,
    type StyleProp,
    type ViewStyle,
} from "react-native";
import { themeColors } from "../../theme/colors";
import { toImageSource } from "../../utils/imageSource";
import type { ProductData } from "./ProductCard";
import { AssetIcon, GlassPanel, ShareButton } from "./Common";

export interface ProductCardCarouselProps {
    products: ProductData[];
    autoplayInterval?: number;
    autoplay?: boolean;
    style?: StyleProp<ViewStyle>;
    onProductPress?: (product: ProductData) => void;
    onSharePress?: (product: ProductData) => void;
}

const MAX_PRODUCTS = 6;

export function ProductCardCarousel({
    products,
    autoplayInterval = 5000,
    autoplay = true,
    style,
    onProductPress,
    onSharePress,
}: ProductCardCarouselProps) {
    const displayProducts = useMemo(() => products.slice(0, MAX_PRODUCTS), [products]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [expandedDesc, setExpandedDesc] = useState(false);
    const [containerWidth, setContainerWidth] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const scrollRef = useRef<ScrollViewType>(null);
    const indexRef = useRef(0);

    useEffect(() => {
        indexRef.current = currentIndex;
    }, [currentIndex]);

    useEffect(() => {
        if (!autoplay || displayProducts.length <= 1 || containerWidth <= 0) return;

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        timerRef.current = setInterval(
            () => {
                const next = (indexRef.current + 1) % displayProducts.length;
                indexRef.current = next;
                setCurrentIndex(next);
                setExpandedDesc(false);
                scrollRef.current?.scrollTo({
                    x: next * containerWidth,
                    animated: true,
                });
            },
            Math.max(1500, autoplayInterval),
        );

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [autoplay, autoplayInterval, containerWidth, displayProducts.length]);

    useEffect(() => {
        if (currentIndex > displayProducts.length - 1) {
            setCurrentIndex(0);
            indexRef.current = 0;
        }
    }, [currentIndex, displayProducts.length]);

    const handleLayout = (event: LayoutChangeEvent) => {
        const width = event.nativeEvent.layout.width;
        if (width > 0 && width !== containerWidth) {
            setContainerWidth(width);
            requestAnimationFrame(() => {
                scrollRef.current?.scrollTo({
                    x: currentIndex * width,
                    animated: false,
                });
            });
        }
    };

    const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (containerWidth <= 0) return;
        const nextIndex = Math.round(event.nativeEvent.contentOffset.x / containerWidth);
        if (nextIndex !== currentIndex) {
            setCurrentIndex(nextIndex);
            indexRef.current = nextIndex;
            setExpandedDesc(false);
        }
    };

    const jumpToIndex = (index: number) => {
        const normalized = (index + displayProducts.length) % displayProducts.length;
        setCurrentIndex(normalized);
        indexRef.current = normalized;
        setExpandedDesc(false);
        scrollRef.current?.scrollTo({
            x: normalized * containerWidth,
            animated: true,
        });
    };

    if (displayProducts.length === 0) {
        return null;
    }

    return (
        <View style={[styles.root, style]}>
            <View style={styles.shadowLayer} />

            <View style={styles.carouselFrame} onLayout={handleLayout}>
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    onMomentumScrollEnd={handleScrollEnd}
                    scrollEventThrottle={16}
                    style={styles.scroll}
                >
                    {displayProducts.map((product, index) => {
                        const workInfo = getWorkTypeInfo(product.type, true);
                        const workTypeIcon = workInfo
                            ? images.works.product[workInfo.iconKey]
                            : undefined;
                        return (
                            <Pressable
                                key={`${product.id}-${index}`}
                                onPress={() => {
                                    onProductPress?.(product);
                                }}
                                style={[
                                    styles.slide,
                                    containerWidth > 0
                                        ? { width: containerWidth }
                                        : { width: "100%" },
                                ]}
                            >
                                <View style={styles.slideImageWrap}>
                                    <Image
                                        source={
                                            toImageSource(product.coverUrl) ??
                                            toImageSource(images.empty)
                                        }
                                        style={styles.slideImage}
                                        resizeMode="cover"
                                    />
                                </View>

                                <ShareButton
                                    size="large"
                                    isShared={Boolean(product.isShared)}
                                    shareCount={product.shareCount ?? 0}
                                    style={styles.shareButton}
                                    onPress={() => {
                                        if (onSharePress) {
                                            onSharePress(product);
                                            return;
                                        }
                                        product.handleShareClick?.(product);
                                    }}
                                />

                                {workInfo ? (
                                    <View style={styles.typeWrap}>
                                        <AssetIcon icon={workTypeIcon} style={styles.typeIcon} />
                                        <Text numberOfLines={1} style={styles.typeText}>
                                            {workInfo.text}
                                        </Text>
                                    </View>
                                ) : null}

                                <View style={styles.bottomPanelWrap}>
                                    <GlassPanel style={styles.bottomPanel}>
                                        <Text numberOfLines={1} style={styles.nameText}>
                                            《{product.name}》
                                        </Text>
                                        <Text numberOfLines={1} style={styles.creatorText}>
                                            {(product.creators ?? []).slice(0, 3).join("/")}
                                        </Text>
                                        {product.description ? (
                                            <Pressable
                                                onPress={() => {
                                                    if (index === currentIndex) {
                                                        setExpandedDesc(prev => !prev);
                                                    }
                                                }}
                                            >
                                                <Text
                                                    numberOfLines={
                                                        expandedDesc && index === currentIndex
                                                            ? 0
                                                            : 2
                                                    }
                                                    style={styles.descText}
                                                >
                                                    {product.description}
                                                </Text>
                                            </Pressable>
                                        ) : null}
                                    </GlassPanel>
                                    <AssetIcon
                                        icon={images.works.descTop}
                                        style={styles.descArrow}
                                    />
                                </View>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>

            {displayProducts.length > 1 ? (
                <View style={styles.dots}>
                    {displayProducts.map((item, index) => (
                        <Pressable
                            key={`${item.id}-${index}-dot`}
                            onPress={() => jumpToIndex(index)}
                            style={[
                                styles.dot,
                                index === currentIndex ? styles.dotActive : styles.dotInactive,
                            ]}
                        />
                    ))}
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    // 轮播外层容器
    root: {
        width: "100%",
        maxWidth: 330,
        alignSelf: "center",
        aspectRatio: 320 / 462,
        marginTop: 6,
        position: "relative",
    },
    // 轮播阴影描边层（无背景色，仅阴影）
    shadowLayer: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "92%",
        borderRadius: 25,
        borderWidth: 1,
        borderColor: "rgba(200, 28, 197, 0.41)",
        shadowColor: themeColors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
        boxShadow: "0 0 8px 0 rgba(228, 21, 153, 0.33) inset",
        backgroundColor: "transparent",
        pointerEvents: "none",
    },
    // 轮播可视区域容器
    carouselFrame: {
        width: "92.5%",
        height: "100%",
        alignSelf: "center",
        borderRadius: 26,
        overflow: "hidden",
    },
    // 轮播滚动层
    scroll: {
        width: "100%",
        height: "100%",
    },
    // 单个轮播页容器
    slide: {
        height: "100%",
        position: "relative",
        overflow: "visible",
    },
    // 大卡片图片容器（为底部信息面板预留安全区）
    slideImageWrap: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 106,
        borderRadius: 26,
        overflow: "hidden",
        backgroundColor: "#f5f5f5",
    },
    // 大卡片图片
    slideImage: {
        width: "100%",
        height: "100%",
        backgroundColor: "#f5f5f5",
    },
    // 左上角分享按钮
    shareButton: {
        position: "absolute",
        top: 14,
        left: 14,
        zIndex: 8,
    },
    // 右上角作品类型区域
    typeWrap: {
        position: "absolute",
        top: 14,
        right: 14,
        minHeight: 25,
        flexDirection: "row",
        alignItems: "center",
        maxWidth: "58%",
        justifyContent: "flex-end",
        zIndex: 8,
    },
    // 作品类型图标
    typeIcon: {
        width: 14,
        height: 12,
        marginRight: 3,
    },
    // 作品类型文字
    typeText: {
        color: "#ffffff",
        fontSize: 12,
        lineHeight: 14,
        flexShrink: 1,
        textAlign: "right",
    },
    // 底部信息区外层容器
    bottomPanelWrap: {
        position: "absolute",
        zIndex: 9,
        left: "4%",
        right: "4%",
        bottom: 22,
        alignItems: "center",
    },
    // 大卡片底部信息面板（毛玻璃）
    bottomPanel: {
        minHeight: 92,
        borderRadius: 11,
        width: "100%",
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignItems: "center",
    },
    // 底部作品名
    nameText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 3,
        width: "100%",
        textAlign: "center",
    },
    // 底部作者名
    creatorText: {
        color: "#ffffff",
        fontSize: 11,
        marginBottom: 4,
        width: "100%",
        textAlign: "center",
    },
    // 底部描述文案
    descText: {
        color: "rgba(185,185,185,1)",
        fontSize: 10,
        lineHeight: 13,
        textAlign: "center",
    },
    // 底部装饰箭头
    descArrow: {
        width: 18,
        height: 18,
        marginTop: -8,
    },
    // 底部轮播指示器容器
    dots: {
        position: "absolute",
        bottom: 8,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
    },
    // 指示器圆点
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 3,
    },
    // 激活态指示器
    dotActive: {
        backgroundColor: "#eb1484",
    },
    // 非激活态指示器
    dotInactive: {
        backgroundColor: "rgba(153, 153, 153, 0.4)",
    },
});
