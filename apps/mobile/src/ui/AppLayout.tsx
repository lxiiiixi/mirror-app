import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
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
import { SafeAreaView } from "react-native-safe-area-context";

export interface AppLayoutFooterItem {
    label: ReactNode;
    icon?: ReactNode;
    activeIcon?: ReactNode;
    key?: string | number;
    onPress?: () => void;
}

export interface AppLayoutProps extends Omit<ScrollViewProps, "children"> {
    children: ReactNode;
    showWalletBar?: boolean;
    showPageNav?: boolean;
    pageTitle?: ReactNode;
    headerRight?: ReactNode;
    assetsLabel?: ReactNode;
    loginLabel?: ReactNode;
    isLoggedIn?: boolean;
    onLogoPress?: () => void;
    onWalletPress?: () => void;
    onBackPress?: () => void;
    backIcon?: ReactNode;
    onLanguagePress?: () => void;
    footerItems?: AppLayoutFooterItem[];
    activeFooterIndex?: number;
    showFooter?: boolean;
    autoHideHeaderOnScroll?: boolean;
}

export function AppLayout({
    children,
    showWalletBar = true,
    showPageNav = false,
    pageTitle,
    headerRight,
    assetsLabel = "Assets",
    loginLabel = "Login",
    isLoggedIn = false,
    onLogoPress,
    onWalletPress,
    onBackPress,
    backIcon = "←",
    onLanguagePress,
    footerItems = [],
    activeFooterIndex = 0,
    showFooter = true,
    autoHideHeaderOnScroll = true,
    onScroll,
    scrollEventThrottle,
    contentContainerStyle,
    ...scrollProps
}: AppLayoutProps) {
    const shouldShowHeader = showWalletBar || showPageNav;
    const shouldShowFooter = showFooter && footerItems.length > 0;
    const headerOffset = useRef(new Animated.Value(0)).current;
    const headerOffsetRef = useRef(0);
    const headerVisibleRef = useRef(true);
    const [headerVisible, setHeaderVisibleState] = useState(true);
    const lastScrollYRef = useRef(0);
    const headerHeightRef = useRef(54);

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
            if (autoHideHeaderOnScroll && shouldShowHeader) {
                const nextY = Math.max(event.nativeEvent.contentOffset.y, 0);
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
            lastScrollYRef.current = 0;
            headerOffset.setValue(0);
        }
    }, [autoHideHeaderOnScroll, headerOffset, shouldShowHeader]);
    const showHeaderContent = !autoHideHeaderOnScroll || headerVisible;

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
            {shouldShowHeader ? (
                <Animated.View
                    onLayout={handleHeaderLayout}
                    style={[
                        styles.header,
                        autoHideHeaderOnScroll && {
                            transform: [{ translateY: Animated.multiply(headerOffset, -1) }],
                            marginBottom: Animated.multiply(headerOffset, -1),
                        },
                    ]}
                >
                    {showWalletBar && showHeaderContent ? (
                        <>
                            <Pressable style={styles.headerChip} onPress={onLanguagePress}>
                                <Text style={styles.headerChipText}>Lang</Text>
                            </Pressable>

                            <Pressable style={styles.logoButton} onPress={onLogoPress}>
                                <Text style={styles.logoText}>MIRROR</Text>
                            </Pressable>

                            <Pressable style={styles.walletButton} onPress={onWalletPress}>
                                <Text style={styles.walletButtonText}>
                                    {isLoggedIn ? assetsLabel : loginLabel}
                                </Text>
                            </Pressable>
                        </>
                    ) : null}

                    {showPageNav && showHeaderContent ? (
                        <>
                            <Pressable style={styles.backButton} onPress={onBackPress}>
                                <Text style={styles.backText}>{backIcon}</Text>
                            </Pressable>
                            <View style={styles.pageTitleWrap}>
                                <Text numberOfLines={1} style={styles.pageTitle}>
                                    {pageTitle}
                                </Text>
                            </View>
                            <View style={styles.headerRight}>{headerRight}</View>
                        </>
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
                <SafeAreaView style={styles.footer} edges={["bottom", "left", "right"]}>
                    <View style={styles.footerInner}>
                        {footerItems.map((item, index) => {
                            const isActive = index === activeFooterIndex;
                            const icon = isActive ? (item.activeIcon ?? item.icon) : item.icon;
                            return (
                                <Pressable
                                    key={item.key ?? index}
                                    style={styles.footerItem}
                                    onPress={item.onPress}
                                >
                                    <Text
                                        style={[
                                            styles.footerIcon,
                                            isActive && styles.footerIconActive,
                                        ]}
                                    >
                                        {icon}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.footerLabel,
                                            isActive && styles.footerLabelActive,
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </SafeAreaView>
            ) : null}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    header: {
        minHeight: 54,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
        backgroundColor: "rgba(248, 250, 252, 0.96)",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    headerChip: {
        borderRadius: 999,
        backgroundColor: "#eef2ff",
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    headerChipText: {
        color: "#3730a3",
        fontWeight: "600",
        fontSize: 12,
    },
    logoButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    logoText: {
        fontSize: 15,
        fontWeight: "800",
        letterSpacing: 0.5,
        color: "#0f172a",
    },
    walletButton: {
        borderRadius: 999,
        backgroundColor: "#0f172a",
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    walletButtonText: {
        color: "#ffffff",
        fontWeight: "600",
        fontSize: 12,
    },
    backButton: {
        width: 56,
        height: 32,
        alignItems: "flex-start",
        justifyContent: "center",
    },
    backText: {
        color: "#0f172a",
        fontSize: 20,
        fontWeight: "700",
        lineHeight: 22,
    },
    pageTitleWrap: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 6,
    },
    pageTitle: {
        color: "#0f172a",
        fontSize: 16,
        fontWeight: "700",
    },
    headerRight: {
        minWidth: 56,
        alignItems: "flex-end",
    },
    scroll: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 15,
        paddingTop: 12,
        paddingBottom: 18,
        gap: 12,
    },
    contentWithFooter: {
        paddingBottom: 104,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: "#e2e8f0",
        backgroundColor: "#ffffff",
    },
    footerInner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        paddingHorizontal: 10,
        paddingTop: 8,
        paddingBottom: 6,
    },
    footerItem: {
        minWidth: 80,
        alignItems: "center",
        gap: 3,
        paddingVertical: 4,
    },
    footerIcon: {
        color: "#94a3b8",
        fontSize: 12,
        fontWeight: "700",
    },
    footerIconActive: {
        color: "#0f172a",
    },
    footerLabel: {
        color: "#64748b",
        fontSize: 11,
        fontWeight: "600",
    },
    footerLabelActive: {
        color: "#0f172a",
    },
});
