import { images } from "@mirror/assets";
import { type ReactNode, isValidElement, useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    Image,
    type LayoutChangeEvent,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    type ScrollViewProps,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Rect, Stop } from "react-native-svg";
import { themeColors } from "../theme/colors";
import { toImageSource } from "../utils/imageSource";

type FooterIconValue = ReactNode | string | number;

export interface AppLayoutFooterItem {
    label: ReactNode;
    icon?: FooterIconValue;
    activeIcon?: FooterIconValue;
    position?: "left" | "center" | "right";
    key?: string | number;
    onPress?: () => void;
}

export interface AppLayoutProps extends Omit<ScrollViewProps, "children"> {
    children: ReactNode;
    showWalletBar?: boolean;
    showPageNav?: boolean;
    pageTitle?: ReactNode;
    headerRight?: ReactNode;
    languageSelect?: ReactNode;
    assetsLabel?: ReactNode;
    loginLabel?: ReactNode;
    isLoggedIn?: boolean;
    onLogoPress?: () => void;
    onWalletPress?: () => void;
    onBackPress?: () => void;
    backIcon?: ReactNode;
    footerItems?: AppLayoutFooterItem[];
    activeFooterIndex?: number;
    showFooter?: boolean;
    autoHideHeaderOnScroll?: boolean;
}

const PAGE_NAV_SIDE_WIDTH = 96;

export function AppLayout({
    children,
    showWalletBar = true,
    showPageNav = false,
    pageTitle,
    headerRight,
    languageSelect,
    assetsLabel = "Assets",
    loginLabel = "Login",
    isLoggedIn = false,
    onLogoPress,
    onWalletPress,
    onBackPress,
    backIcon,
    footerItems = [],
    activeFooterIndex = 0,
    showFooter = true,
    autoHideHeaderOnScroll = true,
    onScroll,
    scrollEventThrottle,
    contentContainerStyle,
    ...scrollProps
}: AppLayoutProps) {
    const insets = useSafeAreaInsets();
    const shouldShowHeader = showWalletBar || showPageNav;
    const shouldShowFooter = showFooter && footerItems.length > 0;
    const headerOffset = useRef(new Animated.Value(0)).current;
    const headerOffsetRef = useRef(0);
    const headerVisibleRef = useRef(true);
    const [headerVisible, setHeaderVisibleState] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const lastScrollYRef = useRef(0);
    const headerHeightRef = useRef(50);

    const logoSource = toImageSource(images.logo);
    const defaultBackIconSource = toImageSource(images.works.backBtn);
    const footerBackgroundSource = toImageSource(images.nav.footBarBg);

    const setHeaderVisible = useCallback(
        (visible: boolean) => {
            if (headerVisibleRef.current === visible) {
                return;
            }

            headerVisibleRef.current = visible;
            setHeaderVisibleState(visible);

            const targetOffset = visible ? 0 : headerHeightRef.current;
            headerOffsetRef.current = targetOffset;
            Animated.timing(headerOffset, {
                toValue: targetOffset,
                duration: 140,
                useNativeDriver: false,
            }).start();
        },
        [headerOffset],
    );

    const handleHeaderLayout = useCallback(
        (event: LayoutChangeEvent) => {
            const nextHeight = event.nativeEvent.layout.height;
            if (nextHeight > 0) {
                headerHeightRef.current = nextHeight;
                if (!headerVisibleRef.current) {
                    headerOffsetRef.current = nextHeight;
                    headerOffset.setValue(nextHeight);
                }
            }
        },
        [headerOffset],
    );

    const handleScroll = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const nextY = Math.max(event.nativeEvent.contentOffset.y, 0);
            setIsScrolled(nextY > 0);

            if (autoHideHeaderOnScroll && shouldShowHeader) {
                const delta = nextY - lastScrollYRef.current;
                if (nextY <= 2) {
                    setHeaderVisible(true);
                } else if (delta > 6) {
                    setHeaderVisible(false);
                } else if (delta < -6) {
                    setHeaderVisible(true);
                }
                lastScrollYRef.current = nextY;
            }

            onScroll?.(event);
        },
        [autoHideHeaderOnScroll, onScroll, setHeaderVisible, shouldShowHeader],
    );

    useEffect(() => {
        if (!autoHideHeaderOnScroll || !shouldShowHeader) {
            headerOffsetRef.current = 0;
            headerVisibleRef.current = true;
            setHeaderVisibleState(true);
            setIsScrolled(false);
            lastScrollYRef.current = 0;
            headerOffset.setValue(0);
        }
    }, [autoHideHeaderOnScroll, headerOffset, shouldShowHeader]);

    const showHeaderContent = !autoHideHeaderOnScroll || headerVisible;

    const renderFooterIcon = (
        iconValue: FooterIconValue | undefined,
        isActive: boolean,
        position: AppLayoutFooterItem["position"],
    ) => {
        if (iconValue == null) {
            return null;
        }

        const imageSource =
            typeof iconValue === "string" || typeof iconValue === "number"
                ? toImageSource(iconValue)
                : undefined;

        const iconImageStyle = [
            styles.footerIconImage,
            position === "center" && styles.footerIconImageCenter,
            isActive && styles.footerIconImageActive,
            isActive && position === "center" && styles.footerIconImageCenterActive,
        ];

        if (imageSource) {
            return <Image source={imageSource} style={iconImageStyle} resizeMode="contain" />;
        }

        if (typeof iconValue === "string" || typeof iconValue === "number") {
            return (
                <Text style={[styles.footerIconText, isActive && styles.footerIconTextActive]}>
                    {iconValue}
                </Text>
            );
        }

        if (isValidElement(iconValue)) {
            return iconValue;
        }

        return null;
    };

    const renderFooterLabel = (label: ReactNode, isActive: boolean) => {
        if (typeof label === "string" || typeof label === "number") {
            return (
                <Text style={[styles.footerLabel, isActive && styles.footerLabelActive]}>
                    {label}
                </Text>
            );
        }

        return <View>{label}</View>;
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
            <View pointerEvents="none" style={styles.backgroundLayer}>
                <Svg height="100%" width="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <Defs>
                        <LinearGradient id="pageGradient" x1="0" y1="0" x2="1" y2="1">
                            <Stop offset="5%" stopColor="#1f1a48" />
                            <Stop offset="20%" stopColor="#0d233f" />
                            <Stop offset="40%" stopColor="#030620" />
                            <Stop offset="100%" stopColor="#030620" />
                        </LinearGradient>
                        <RadialGradient id="leftOrb" cx="30%" cy="30%" r="60%">
                            <Stop offset="0%" stopColor="#03254c" stopOpacity="0.95" />
                            <Stop offset="52%" stopColor="#03254c" stopOpacity="0.35" />
                            <Stop offset="100%" stopColor="#03254c" stopOpacity="0" />
                        </RadialGradient>
                        <RadialGradient id="rightOrb" cx="70%" cy="30%" r="58%">
                            <Stop offset="0%" stopColor="#4E18F0" stopOpacity="0.28" />
                            <Stop offset="56%" stopColor="#4E18F0" stopOpacity="0.12" />
                            <Stop offset="100%" stopColor="#4E18F0" stopOpacity="0" />
                        </RadialGradient>
                    </Defs>
                    <Rect fill="url(#pageGradient)" height="100" width="100" x="0" y="0" />
                    <Circle cx="-8" cy="-10" r="38" fill="url(#leftOrb)" />
                    <Circle cx="108" cy="-8" r="30" fill="url(#rightOrb)" />
                </Svg>
            </View>

            {shouldShowHeader ? (
                <Animated.View
                    onLayout={handleHeaderLayout}
                    style={[
                        styles.header,
                        isScrolled && styles.headerScrolled,
                        autoHideHeaderOnScroll && {
                            transform: [{ translateY: Animated.multiply(headerOffset, -1) }],
                            marginBottom: Animated.multiply(headerOffset, -1),
                        },
                    ]}
                >
                    {showWalletBar && showHeaderContent ? (
                        <View style={styles.walletHeaderRow}>
                            <View style={styles.headerLeftSlot}>{languageSelect}</View>
                            <View pointerEvents="box-none" style={styles.headerCenterOverlay}>
                                <Pressable style={styles.logoButton} onPress={onLogoPress}>
                                    {logoSource ? (
                                        <Image
                                            source={logoSource}
                                            style={styles.logoImage}
                                            resizeMode="contain"
                                        />
                                    ) : (
                                        <Text style={styles.logoText}>MIRROR</Text>
                                    )}
                                </Pressable>
                            </View>
                            <View style={styles.headerRightSlot}>
                                <Pressable
                                    style={[
                                        styles.walletButton,
                                        isLoggedIn && styles.walletButtonAssets,
                                    ]}
                                    onPress={onWalletPress}
                                >
                                    <Text style={styles.walletButtonText}>
                                        {isLoggedIn ? assetsLabel : loginLabel}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    ) : null}

                    {showPageNav && showHeaderContent ? (
                        <View style={styles.pageNavRow}>
                            <View style={[styles.pageNavSide, styles.pageNavLeft]}>
                                <Pressable style={styles.backButton} onPress={onBackPress}>
                                    {backIcon ? (
                                        typeof backIcon === "string" ||
                                        typeof backIcon === "number" ? (
                                            toImageSource(backIcon) ? (
                                                <Image
                                                    source={toImageSource(backIcon)}
                                                    style={styles.backImage}
                                                    resizeMode="contain"
                                                />
                                            ) : (
                                                <Text style={styles.backText}>{backIcon}</Text>
                                            )
                                        ) : (
                                            backIcon
                                        )
                                    ) : defaultBackIconSource ? (
                                        <Image
                                            source={defaultBackIconSource}
                                            style={styles.backImage}
                                            resizeMode="contain"
                                        />
                                    ) : (
                                        <Text style={styles.backText}>←</Text>
                                    )}
                                </Pressable>
                            </View>

                            <View pointerEvents="none" style={styles.pageTitleOverlay}>
                                <View style={styles.pageTitleWrap}>
                                    <Text numberOfLines={1} style={styles.pageTitle}>
                                        {pageTitle}
                                    </Text>
                                </View>
                            </View>

                            <View style={[styles.pageNavSide, styles.pageNavRight]}>
                                <View style={styles.headerRight}>{headerRight}</View>
                            </View>
                        </View>
                    ) : null}
                </Animated.View>
            ) : null}

            <ScrollView
                {...scrollProps}
                onScroll={handleScroll}
                scrollEventThrottle={scrollEventThrottle ?? 16}
                style={styles.scroll}
                contentContainerStyle={[
                    styles.content,
                    shouldShowFooter && styles.contentWithFooter,
                    contentContainerStyle,
                ]}
            >
                {children}
            </ScrollView>

            {shouldShowFooter ? (
                <SafeAreaView
                    style={[
                        styles.footerSafeArea,
                        { paddingBottom: Math.max(insets.bottom - 10, 0) },
                    ]}
                    edges={["left", "right"]}
                >
                    <View style={styles.footerFrame}>
                        {footerBackgroundSource ? (
                            <Image
                                source={footerBackgroundSource}
                                style={styles.footerBackgroundImage}
                                resizeMode="stretch"
                            />
                        ) : null}
                        <View style={styles.footerInner}>
                            {footerItems.map((item, index) => {
                                const isActive = index === activeFooterIndex;
                                const icon = isActive ? (item.activeIcon ?? item.icon) : item.icon;
                                return (
                                    <Pressable
                                        key={item.key ?? index}
                                        style={[
                                            styles.footerItem,
                                            item.position === "left" && styles.footerItemLeft,
                                            item.position === "right" && styles.footerItemRight,
                                        ]}
                                        onPress={item.onPress}
                                    >
                                        <View style={styles.footerIconSlot}>
                                            {renderFooterIcon(icon, isActive, item.position)}
                                        </View>
                                        <View style={styles.footerLabelSlot}>
                                            {renderFooterLabel(item.label, isActive)}
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                </SafeAreaView>
            ) : null}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#030620",
    },
    backgroundLayer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
    },
    header: {
        minHeight: 50,
        paddingHorizontal: 15,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        zIndex: 20,
    },
    walletHeaderRow: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerScrolled: {
        // backgroundColor#2d117ee5.9)",
    },
    headerLeftSlot: {
        width: 90,
        height: 27,
        justifyContent: "center",
        alignItems: "flex-start",
    },
    headerCenterOverlay: {
        position: "absolute",
        left: 0,
        right: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    logoButton: {
        padding: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    logoImage: {
        width: 110,
        height: 40,
        marginTop: -10,
    },
    logoText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "700",
        letterSpacing: 1.8,
    },
    headerRightSlot: {
        width: 90,
        height: 27,
        alignItems: "flex-end",
        justifyContent: "center",
    },
    walletButton: {
        width: 80,
        height: 27,
        borderRadius: 4,
        backgroundColor: themeColors.primary,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 8,
    },
    walletButtonAssets: {
        backgroundColor: "#5546f5",
    },
    walletButtonText: {
        color: "#ffffff",
        fontWeight: "700",
        fontSize: 12,
        lineHeight: 16,
    },
    pageNavRow: {
        width: "100%",
        minHeight: 28,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
    },
    pageNavSide: {
        width: PAGE_NAV_SIDE_WIDTH,
        minHeight: 28,
        justifyContent: "center",
    },
    pageNavLeft: {
        alignItems: "flex-start",
    },
    pageNavRight: {
        alignItems: "flex-end",
    },
    backButton: {
        zIndex: 10,
        width: 32,
        height: 28,
        alignItems: "center",
        justifyContent: "center",
    },
    backImage: {
        width: 20,
        height: 20,
    },
    backText: {
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "700",
        lineHeight: 22,
    },
    pageTitleOverlay: {
        position: "absolute",
        left: PAGE_NAV_SIDE_WIDTH + 4,
        right: PAGE_NAV_SIDE_WIDTH + 4,
        top: 0,
        bottom: 0,
        justifyContent: "center",
    },
    pageTitleWrap: {
        alignItems: "center",
        justifyContent: "center",
    },
    pageTitle: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "700",
        textAlign: "center",
    },
    headerRight: {
        alignItems: "flex-end",
        justifyContent: "center",
        minWidth: 40,
    },
    scroll: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 18,
        gap: 12,
    },
    contentWithFooter: {
        paddingBottom: 136,
    },
    footerSafeArea: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: -2,
        alignItems: "center",
        backgroundColor: "transparent",
    },
    footerFrame: {
        width: 294,
        height: 98,
        alignItems: "center",
        justifyContent: "center",
    },
    footerBackgroundImage: {
        ...StyleSheet.absoluteFillObject,
        width: "100%",
        height: "100%",
    },
    footerInner: {
        width: "100%",
        height: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
    },
    footerItem: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    footerItemLeft: {
        marginLeft: 20,
    },
    footerItemRight: {
        marginRight: 20,
    },
    footerIconSlot: {
        width: 72,
        height: 45,
        alignItems: "center",
        justifyContent: "center",
    },
    footerLabelSlot: {
        width: 72,
        height: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    footerIconImage: {
        marginTop: 13,
        width: 25,
        height: 25,
    },
    footerIconImageActive: {
        marginTop: 15,
        width: 44,
        height: 44,
    },
    footerIconImageCenter: {
        marginTop: -2,
        width: 43,
        height: 43,
    },
    footerIconImageCenterActive: {
        marginTop: -2,
        width: 62,
        height: 62,
    },
    footerIconText: {
        color: "#fcfcfc",
        fontSize: 14,
        fontWeight: "700",
    },
    footerIconTextActive: {
        color: "#ff2696",
    },
    footerLabel: {
        color: "#fcfcfc",
        fontSize: 12,
        fontWeight: "500",
    },
    footerLabelActive: {
        color: "#ff2696",
    },
});
