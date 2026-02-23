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
import { AssetIcon, ShareButton } from "./Common";

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
        const width = Math.floor(event.nativeEvent.layout.width);
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
        <View style={[styles.root, style]} onLayout={handleLayout}>
            <View style={styles.shadowLayer} />

            <View style={styles.carouselFrame}>
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
                                <Image
                                    source={
                                        toImageSource(product.coverUrl) ??
                                        toImageSource(images.empty)
                                    }
                                    style={styles.slideImage}
                                    resizeMode="cover"
                                />

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
                                        <Text style={styles.typeText}>{workInfo.text}</Text>
                                    </View>
                                ) : null}

                                <View style={styles.bottomPanel}>
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
                                                    expandedDesc && index === currentIndex ? 0 : 2
                                                }
                                                style={styles.descText}
                                            >
                                                {product.description}
                                            </Text>
                                        </Pressable>
                                    ) : null}
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
    root: {
        width: "100%",
        maxWidth: 330,
        alignSelf: "center",
        aspectRatio: 320 / 430,
        marginTop: 10,
        position: "relative",
    },
    shadowLayer: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: "92%",
        borderRadius: 25,
        borderWidth: 1,
        borderColor: "rgba(200, 28, 197, 0.41)",
        shadowColor: themeColors.primary,
        shadowOpacity: 0.35,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 1 },
        boxShadow: "0 0 8px 0 rgba(228, 21, 153, 0.33) inset",
    },
    carouselFrame: {
        width: "92.5%",
        height: "100%",
        alignSelf: "center",
        borderRadius: 26,
        overflow: "hidden",
        paddingBottom: 28,
    },
    scroll: {
        width: "100%",
        height: "94.43%",
    },
    slide: {
        height: "100%",
        position: "relative",
    },
    slideImage: {
        width: "100%",
        height: "100%",
        borderRadius: 26,
        backgroundColor: "#f5f5f5",
    },
    shareButton: {
        position: "absolute",
        top: 15,
        left: 15,
        zIndex: 8,
    },
    typeWrap: {
        position: "absolute",
        top: 15,
        right: 15,
        minHeight: 25,
        flexDirection: "row",
        alignItems: "center",
    },
    typeIcon: {
        width: 16,
        height: 14,
        marginRight: 4,
    },
    typeText: {
        color: "#ffffff",
        fontSize: 16,
        lineHeight: 19,
    },
    bottomPanel: {
        position: "absolute",
        zIndex: 9,
        width: "94%",
        minHeight: "21.88%",
        borderRadius: 11,
        left: "3%",
        bottom: "-4.35%",
        borderWidth: 1,
        borderColor: "rgba(67,67,67,1)",
        backgroundColor: "rgba(61, 61, 92, 0.78)",
        paddingHorizontal: 20,
        paddingVertical: 10,
        alignItems: "center",
    },
    nameText: {
        color: "#ffffff",
        fontSize: 17,
        fontWeight: "600",
        marginBottom: 5,
        width: "100%",
        textAlign: "center",
    },
    creatorText: {
        color: "#ffffff",
        fontSize: 13,
        marginBottom: 5,
        width: "100%",
        textAlign: "center",
    },
    descText: {
        color: "rgba(185,185,185,1)",
        fontSize: 11,
        lineHeight: 14,
        textAlign: "center",
    },
    descArrow: {
        width: 18,
        height: 18,
        position: "absolute",
        left: "50%",
        marginLeft: -9,
        bottom: -10,
    },
    dots: {
        position: "absolute",
        bottom: 10,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 3,
    },
    dotActive: {
        backgroundColor: "#eb1484",
    },
    dotInactive: {
        backgroundColor: "rgba(153, 153, 153, 0.4)",
    },
});
