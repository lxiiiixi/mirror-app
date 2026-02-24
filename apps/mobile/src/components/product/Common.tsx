import { images } from "@mirror/assets";
import { type ReactNode } from "react";
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    type ImageStyle,
    type StyleProp,
    type ViewStyle,
} from "react-native";
import { SvgUri } from "react-native-svg";
import { toImageSource } from "../../utils/imageSource";

export type ShareButtonSize = "small" | "large";

export interface ShareButtonProps {
    size?: ShareButtonSize;
    isShared?: boolean;
    shareCount?: number;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
}

export interface AssetIconProps {
    icon?: string | number;
    style?: StyleProp<ImageStyle>;
}

export interface GlassPanelProps {
    children?: ReactNode;
    style?: StyleProp<ViewStyle>;
    intensity?: number;
    tint?: "light" | "dark" | "default" | string;
}

export function AssetIcon({ icon, style }: AssetIconProps) {
    const source = toImageSource(icon);
    if (!source) {
        return null;
    }

    const uri = Image.resolveAssetSource(source)?.uri;
    const isSvg = typeof uri === "string" && uri.includes(".svg");

    if (isSvg && uri) {
        return (
            <View style={style}>
                <SvgUri uri={uri} width="100%" height="100%" />
            </View>
        );
    }

    return <Image source={source} style={style} resizeMode="contain" />;
}

export function GlassPanel({ children, style, intensity = 36, tint = "dark" }: GlassPanelProps) {
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
                <BlurViewComponent
                    intensity={intensity}
                    tint={tint}
                    style={[styles.glassPanelBase, style]}
                >
                    {children}
                </BlurViewComponent>
            );
        }
    } catch {
        // fallback to normal translucent panel
    }

    return <View style={[styles.glassPanelBase, styles.glassPanelFallback, style]}>{children}</View>;
}

const SMALL = {
    height: 13,
    iconWidth: 6,
    iconHeight: 6,
    iconPadLeft: 5,
    iconPadRight: 4,
    countPadLeft: 4,
    countPadRight: 5,
    countSize: 7,
};

const LARGE = {
    height: 25,
    iconWidth: 13,
    iconHeight: 13,
    iconPadLeft: 12,
    iconPadRight: 6,
    countPadLeft: 6,
    countPadRight: 12,
    countSize: 12,
};

export function ShareButton({
    size = "small",
    isShared = false,
    shareCount = 0,
    onPress,
    style,
}: ShareButtonProps) {
    const sizing = size === "large" ? LARGE : SMALL;

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            style={[
                styles.wrapper,
                {
                    height: sizing.height,
                    borderRadius: sizing.height / 2,
                },
                style,
            ]}
        >
            <View
                style={[
                    styles.iconArea,
                    {
                        borderRadius: sizing.height / 2,
                        paddingLeft: sizing.iconPadLeft,
                        paddingRight: sizing.iconPadRight,
                    },
                    isShared && styles.iconAreaActive,
                ]}
            >
                <Image
                    source={toImageSource(images.works.toX)}
                    style={{ width: sizing.iconWidth, height: sizing.iconHeight }}
                    resizeMode="contain"
                />
                <Image
                    source={toImageSource(images.works.toXWhite)}
                    style={{ width: sizing.iconWidth, height: sizing.iconHeight }}
                    resizeMode="contain"
                />
            </View>

            <View
                style={[
                    styles.countArea,
                    { paddingLeft: sizing.countPadLeft, paddingRight: sizing.countPadRight },
                ]}
            >
                <Text
                    style={[
                        styles.countText,
                        {
                            fontSize: sizing.countSize,
                            lineHeight: sizing.countSize + 1,
                        },
                    ]}
                >
                    {shareCount}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    // 分享按钮外层容器
    wrapper: {
        flexDirection: "row",
        alignItems: "stretch",
        borderWidth: 1,
        borderColor: "#eb1484",
        overflow: "hidden",
        backgroundColor: "rgba(0,0,0,0.45)",
    },
    // 分享按钮左侧图标区域
    iconArea: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
    },
    // 分享按钮左侧激活态背景
    iconAreaActive: {
        backgroundColor: "#eb1484",
    },
    // 分享按钮右侧数字区域
    countArea: {
        alignItems: "center",
        justifyContent: "center",
    },
    // 分享数字文案
    countText: {
        color: "#ffffff",
        fontWeight: "700",
    },
    // 毛玻璃面板基础样式
    glassPanelBase: {
        borderWidth: 1,
        borderColor: "rgba(127,127,127,0.45)",
        backgroundColor: "rgba(66, 66, 96, 0.42)",
        overflow: "hidden",
    },
    // 毛玻璃不可用时的降级背景
    glassPanelFallback: {
        backgroundColor: "rgba(40, 33, 79, 0.75)",
    },
});
