import { images } from "@mirror/assets";
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

const SMALL = {
    height: 16,
    iconWidth: 8,
    iconHeight: 8,
    iconPadLeft: 7,
    iconPadRight: 5,
    countPadLeft: 5,
    countPadRight: 7,
    countSize: 9,
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
    wrapper: {
        flexDirection: "row",
        alignItems: "stretch",
        borderWidth: 1,
        borderColor: "#eb1484",
        overflow: "hidden",
        backgroundColor: "rgba(0,0,0,0.45)",
    },
    iconArea: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
    },
    iconAreaActive: {
        backgroundColor: "#eb1484",
    },
    countArea: {
        alignItems: "center",
        justifyContent: "center",
    },
    countText: {
        color: "#ffffff",
        fontWeight: "700",
    },
});

