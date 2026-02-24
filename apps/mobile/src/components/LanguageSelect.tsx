import { images } from "@mirror/assets";
import { ChevronDown } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
    type ImageSourcePropType,
    type StyleProp,
    type ViewStyle,
} from "react-native";

export interface LanguageOption {
    value: string;
    label: string;
}

export interface LanguageSelectProps {
    value: string;
    options: LanguageOption[];
    onChange?: (value: string) => void;
    style?: StyleProp<ViewStyle>;
}

export function LanguageSelect({ value, options, onChange, style }: LanguageSelectProps) {
    const [open, setOpen] = useState(false);
    const rawLangIcon = images.nav.lang as unknown;
    const langIconSource: ImageSourcePropType =
        typeof rawLangIcon === "string"
            ? { uri: rawLangIcon }
            : (rawLangIcon as ImageSourcePropType);

    const currentOption = useMemo(
        () =>
            options.find(option => option.value.toLowerCase() === value.toLowerCase()) ??
            options[0],
        [options, value],
    );

    useEffect(() => {
        setOpen(false);
    }, [value]);

    return (
        <View style={[styles.container, style]}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Select language"
                accessibilityState={{ expanded: open }}
                onPress={() => setOpen(prev => !prev)}
                style={({ pressed }) => [
                    styles.trigger,
                    open && styles.triggerOpen,
                    pressed && styles.triggerPressed,
                ]}
            >
                <View style={styles.triggerContent}>
                    <Image source={langIconSource} style={styles.icon} resizeMode="contain" />
                    <Text numberOfLines={1} style={styles.label}>
                        {currentOption?.label ?? "English"}
                    </Text>
                    <ChevronDown
                        size={14}
                        color="#ffffff"
                        strokeWidth={2.2}
                        style={open ? styles.chevronOpen : undefined}
                    />
                </View>
            </Pressable>

            {open ? (
                <View style={styles.dropdown}>
                    {options.map(option => {
                        const isActive = option.value.toLowerCase() === value.toLowerCase();
                        return (
                            <Pressable
                                key={option.value}
                                onPress={() => {
                                    onChange?.(option.value);
                                    setOpen(false);
                                }}
                                style={({ pressed }) => [
                                    styles.option,
                                    isActive && styles.optionActive,
                                    pressed && styles.optionPressed,
                                ]}
                            >
                                <View style={styles.optionContent}>
                                    <Text
                                        style={[
                                            styles.optionText,
                                            isActive && styles.optionTextActive,
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    // 语言选择器容器
    container: {
        position: "relative",
        overflow: "visible",
    },
    // 触发按钮
    trigger: {
        height: 27,
        borderRadius: 6,
        paddingHorizontal: 8,
        backgroundColor: "transparent",
        justifyContent: "center",
    },
    // 触发按钮展开态
    triggerOpen: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    // 触发按钮内容行
    triggerContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    // 语言图标
    icon: {
        width: 16,
        height: 16,
    },
    // 触发按钮按压态
    triggerPressed: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    // 展开图标旋转态
    chevronOpen: {
        transform: [{ rotate: "180deg" }],
    },
    // 触发按钮文本
    label: {
        color: "#ffffff",
        fontSize: 12,
        fontWeight: "700",
    },
    // 下拉面板
    dropdown: {
        position: "absolute",
        top: "100%",
        marginTop: 4,
        left: 0,
        minWidth: 120,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        backgroundColor: "rgba(18, 9, 44, 0.95)",
        paddingVertical: 5,
        zIndex: 100,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
    },
    // 下拉选项
    option: {
        alignSelf: "stretch",
        marginHorizontal: 4,
        marginVertical: 2,
        borderRadius: 6,
        overflow: "hidden",
    },
    // 下拉选项内容容器（确保水平/垂直 padding 可见）
    optionContent: {
        minHeight: 36,
        paddingHorizontal: 12,
        paddingVertical: 8,
        justifyContent: "center",
    },
    // 下拉选项选中态
    optionActive: {
        backgroundColor: "rgba(255, 38, 150, 0.2)",
    },
    // 下拉选项按压态
    optionPressed: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    // 下拉选项文字
    optionText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "500",
        lineHeight: 18,
    },
    // 下拉选项文字选中态
    optionTextActive: {
        color: "rgb(255, 38, 150)",
    },
});
