import { images } from "@mirror/assets";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Easing,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
    type LayoutChangeEvent,
} from "react-native";
import { toImageSource } from "../../utils/imageSource";

export interface HomeNoticeProps {
    message: string;
    onJump?: () => void;
    duration?: number;
}

export function HomeNotice({ message, onJump, duration = 15 }: HomeNoticeProps) {
    const translateX = useRef(new Animated.Value(0)).current;
    const [containerWidth, setContainerWidth] = useState(0);
    const [textWidth, setTextWidth] = useState(0);
    const loopRef = useRef<Animated.CompositeAnimation | null>(null);

    const durationMs = useMemo(() => Math.max(6000, duration * 1000), [duration]);

    useEffect(() => {
        if (containerWidth <= 0 || textWidth <= 0) {
            return;
        }

        translateX.setValue(containerWidth);

        const loop = Animated.loop(
            Animated.timing(translateX, {
                toValue: -textWidth,
                duration: durationMs,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
        );
        loopRef.current = loop;
        loop.start();

        return () => {
            loop.stop();
            loopRef.current = null;
        };
    }, [containerWidth, durationMs, textWidth, translateX]);

    const handleContainerLayout = (event: LayoutChangeEvent) => {
        const nextWidth = Math.floor(event.nativeEvent.layout.width);
        if (nextWidth > 0 && nextWidth !== containerWidth) {
            setContainerWidth(nextWidth);
        }
    };

    const handleTextLayout = (event: LayoutChangeEvent) => {
        const nextWidth = Math.ceil(event.nativeEvent.layout.width);
        if (nextWidth > 0 && nextWidth !== textWidth) {
            setTextWidth(nextWidth);
        }
    };

    return (
        <View style={styles.container}>
            <Image source={toImageSource(images.home.notice)} style={styles.noticeIcon} />

            <View style={styles.marqueeContainer} onLayout={handleContainerLayout}>
                <Animated.View
                    style={[
                        styles.marqueeContent,
                        {
                            transform: [{ translateX }],
                        },
                    ]}
                >
                    <Text numberOfLines={1} style={styles.marqueeText} onLayout={handleTextLayout}>
                        {message}
                    </Text>
                </Animated.View>
            </View>

            {onJump ? (
                <Pressable style={styles.jumpButton} onPress={onJump}>
                    <Image source={toImageSource(images.account.right)} style={styles.jumpIcon} />
                </Pressable>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: 32,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
        backgroundColor: "rgba(126,126,126,0.3)",
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 12,
        paddingRight: 8,
        overflow: "hidden",
    },
    noticeIcon: {
        width: 16,
        height: 16,
        marginRight: 8,
    },
    marqueeContainer: {
        flex: 1,
        overflow: "hidden",
        justifyContent: "center",
    },
    marqueeContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    marqueeText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
        includeFontPadding: false,
    },
    jumpButton: {
        marginLeft: 6,
        minWidth: 24,
        height: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    jumpIcon: {
        width: 10,
        height: 10,
        opacity: 0.9,
    },
});
