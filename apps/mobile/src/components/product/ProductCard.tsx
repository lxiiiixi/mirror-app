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
import { AssetIcon, GlassPanel, ShareButton } from "./Common";

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
                    <Text numberOfLines={1} style={styles.typeText}>
                        {workInfo.text}
                    </Text>
                </View>
            ) : null}

            <GlassPanel style={styles.bottomInfo}>
                <Text numberOfLines={1} style={styles.nameText}>
                    《{product.name}》
                </Text>
                <Text numberOfLines={1} style={styles.creatorText}>
                    {creatorText}
                </Text>
            </GlassPanel>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    // 卡片外层容器
    card: {
        // backgroundColor: "red",
        width: "100%",
        aspectRatio: 110 / 160,
        position: "relative",
        overflow: "visible",
    },
    // 卡片阴影描边层（无背景色，仅阴影）
    shadowLayer: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 10,
        bottom: 0,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(200, 28, 197, 0.41)",
        shadowColor: themeColors.primary,
        shadowOpacity: 0.28,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
        boxShadow: "0 0 8px 0 rgba(228, 21, 153, 0.33) inset",
        backgroundColor: "transparent",
        pointerEvents: "none",
    },
    // 主图容器（给底部信息面板预留空间）
    imageFrame: {
        position: "absolute",
        left: 6,
        right: 6,
        top: 0,
        bottom: 18,
        borderRadius: 8,
        overflow: "hidden",
    },
    // 主图
    coverImage: {
        width: "100%",
        height: "100%",
        backgroundColor: "#f5f5f5",
    },
    // 左上角分享按钮
    shareButton: {
        position: "absolute",
        top: 6,
        left: 12,
        zIndex: 8,
    },
    // 右上角作品类型区域
    typeWrap: {
        position: "absolute",
        top: 6,
        right: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        maxWidth: "58%",
        zIndex: 8,
    },
    // 作品类型图标
    typeIcon: {
        width: 9,
        height: 8,
        marginRight: 3,
    },
    // 作品类型文字
    typeText: {
        color: "#ffffff",
        fontSize: 8,
        lineHeight: 12,
        textAlign: "right",
        flexShrink: 1,
    },
    // 卡片底部信息面板（毛玻璃）
    bottomInfo: {
        position: "absolute",
        zIndex: 9,
        left: 12,
        right: 12,
        bottom: 8,
        minHeight: 30,
        borderRadius: 6,
        paddingHorizontal: 2,
        paddingVertical: 4,
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
    },
    // 底部作品名
    nameText: {
        color: "#ffffff",
        fontSize: 8,
        lineHeight: 12,
        textAlign: "center",
        width: "100%",
    },
    // 底部作者名
    creatorText: {
        color: "#ffffff",
        fontSize: 6,
        lineHeight: 10,
        textAlign: "center",
        width: "100%",
    },
});
