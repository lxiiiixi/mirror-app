import { useCallback, useEffect, useState } from "react";
import {
    Image,
    type ImageSourcePropType,
    type LayoutChangeEvent,
    StyleSheet,
    View,
} from "react-native";

export interface AutoImageProps {
    source?: ImageSourcePropType;
}

export function AutoImage({ source }: AutoImageProps) {
    const [containerWidth, setContainerWidth] = useState(0);
    const [ratio, setRatio] = useState(0);

    const onLayout = useCallback((e: LayoutChangeEvent) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0) setContainerWidth(w);
    }, []);

    useEffect(() => {
        if (!source) return;

        if (typeof source === "number") {
            const resolved = Image.resolveAssetSource(source);
            if (resolved.width && resolved.height) {
                setRatio(resolved.width / resolved.height);
            }
        } else if (!Array.isArray(source) && source.uri) {
            Image.getSize(source.uri, (w, h) => {
                if (h > 0) setRatio(w / h);
            });
        }
    }, [source]);

    const height = ratio > 0 && containerWidth > 0 ? containerWidth / ratio : undefined;

    return (
        <View onLayout={onLayout} style={styles.container}>
            {source && height ? (
                <Image
                    source={source}
                    style={{ width: containerWidth, height }}
                    resizeMode="contain"
                />
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },
});
