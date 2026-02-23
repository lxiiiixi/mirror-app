import { images } from "@mirror/assets";
import { getWorkTypeInfo, type WorkType } from "@mirror/utils";
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
import { AssetIcon, ShareButton } from "./Common";

export interface ProductData {
    id: string | number;
    name: string;
    coverUrl: string | number;
    type: WorkType;
    shareCount?: number;
    likeCount?: number;
    creators?: string[];
    description?: string;
    isShared?: boolean;
    rawType?: number;
    handleShareClick?: (product: ProductData) => void;
}

export interface ProductCardProps {
    product: ProductData;
    style?: StyleProp<ViewStyle>;
    onPress?: (product: ProductData) => void;
    onSharePress?: (product: ProductData) => void;
}

export function ProductCard({ product, style, onPress, onSharePress }: ProductCardProps) {
    const workInfo = getWorkTypeInfo(product.type, true);
    const workTypeIcon = workInfo ? images.works.product[workInfo.iconKey] : undefined;
    const creatorText = (product.creators ?? []).slice(0, 3).join("/");

    return (
        <Pressable
            onPress={() => {
                onPress?.(product);
            }}
            style={[styles.card, style]}
        >
            <View style={styles.shadowLayer} />

            <View style={styles.imageFrame}>
                <Image
                    source={toImageSource(product.coverUrl) ?? toImageSource(images.empty)}
                    style={styles.coverImage}
                    resizeMode="cover"
                />
            </View>

            <ShareButton
                size="small"
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

            <View style={styles.bottomInfo}>
                <Text numberOfLines={1} style={styles.nameText}>
                    《{product.name}》
                </Text>
                <Text numberOfLines={1} style={styles.creatorText}>
                    {creatorText}
                </Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: "100%",
        aspectRatio: 110 / 160,
        position: "relative",
    },
    shadowLayer: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: "85%",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(200, 28, 197, 0.41)",
        shadowColor: themeColors.primary,
        shadowOpacity: 0.35,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 1 },
        backgroundColor: "rgba(35, 18, 75, 0.38)",
    },
    imageFrame: {
        position: "relative",
        width: "90.91%",
        height: "93.75%",
        alignSelf: "center",
    },
    coverImage: {
        width: "100%",
        height: "90%",
        marginTop: "10%",
        borderRadius: 8,
        backgroundColor: "#f5f5f5",
    },
    shareButton: {
        position: "absolute",
        top: 13,
        left: 8,
        zIndex: 8,
    },
    typeWrap: {
        position: "absolute",
        top: 10,
        right: 10,
        flexDirection: "row",
        alignItems: "center",
    },
    typeIcon: {
        width: 9,
        height: 8,
        marginRight: 3,
    },
    typeText: {
        color: "#ffffff",
        fontSize: 8,
        lineHeight: 12,
    },
    bottomInfo: {
        position: "absolute",
        zIndex: 9,
        width: "85.45%",
        minHeight: "25%",
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "rgba(127,127,127,0.4)",
        backgroundColor: "rgba(61, 61, 92, 0.65)",
        bottom: "4.38%",
        left: "7.275%",
        right: "7.275%",
        paddingHorizontal: 5,
        paddingVertical: 5,
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
    },
    nameText: {
        color: "#ffffff",
        fontSize: 8,
        lineHeight: 12,
        textAlign: "center",
        width: "100%",
    },
    creatorText: {
        color: "#ffffff",
        fontSize: 8,
        lineHeight: 12,
        textAlign: "center",
        width: "100%",
    },
});
