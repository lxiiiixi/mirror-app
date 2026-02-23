import { type ReactNode } from "react";
import {
    Image,
    Text,
    TouchableOpacity,
    View,
    type StyleProp,
    type ViewStyle as RNViewStyle,
    type ViewStyle,
} from "react-native";
import { SvgUri } from "react-native-svg";
import { themeColors } from "../theme/colors";
import { toImageSource } from "../utils/imageSource";

export interface ProjectTabItem {
    label: ReactNode;
    iconSrc?: string | number;
    disabled?: boolean;
    key?: string | number;
}

export interface ProjectTabsProps {
    tabs: ProjectTabItem[];
    activeIndex?: number;
    onTabChange?: (index: number, tab: ProjectTabItem) => void;
    padded?: boolean;
    style?: StyleProp<ViewStyle>;
}

const renderLabel = (label: ReactNode, active: boolean, disabled: boolean) => {
    if (typeof label === "string" || typeof label === "number") {
        return (
            <Text
                style={{
                    color: "#ffffff",
                    fontSize: 16,
                    fontWeight: "700",
                    opacity: disabled ? 0.9 : 1,
                }}
            >
                {label}
            </Text>
        );
    }

    return label;
};

export function ProjectTabs({
    tabs,
    activeIndex = 0,
    onTabChange,
    padded = false,
    style,
}: ProjectTabsProps) {
    return (
        <View
            style={[
                {
                    width: "100%",
                    alignSelf: "stretch",
                    marginVertical: 15,
                    flexDirection: "row",
                    alignItems: "center",
                },
                padded ? { paddingHorizontal: 15 } : null,
                style,
            ]}
        >
            {tabs.map((tab, index) => {
                const isActive = index === activeIndex;
                const isDisabled = Boolean(tab.disabled);
                const source = toImageSource(tab.iconSrc);
                const resolvedUri = source ? Image.resolveAssetSource(source)?.uri : undefined;
                const isSvgIcon = typeof resolvedUri === "string" && resolvedUri.includes(".svg");
                const tabStyle: RNViewStyle = {
                    flexBasis: 0,
                    flexGrow: 1,
                    minHeight: 36,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: isActive ? themeColors.primary : "#36408f",
                    backgroundColor: isActive ? themeColors.primary : "#1b234e",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 10,
                    marginRight: index === tabs.length - 1 ? 0 : 9,
                    opacity: isDisabled ? 0.55 : 1,
                };

                return (
                    <TouchableOpacity
                        key={tab.key ?? index}
                        disabled={isDisabled}
                        activeOpacity={0.92}
                        style={tabStyle}
                        onPress={() => {
                            if (isDisabled) return;
                            onTabChange?.(index, tab);
                        }}
                    >
                        {source ? (
                            isSvgIcon && resolvedUri ? (
                                <View
                                    style={{
                                        width: 18,
                                        height: 18,
                                        marginRight: 6,
                                        opacity: isDisabled ? 0.8 : 1,
                                    }}
                                >
                                    <SvgUri
                                        uri={resolvedUri}
                                        width="100%"
                                        height="100%"
                                        color="#ffffff"
                                    />
                                </View>
                            ) : (
                                <Image
                                    source={source}
                                    style={[
                                        {
                                            width: 18,
                                            height: 18,
                                            marginRight: 6,
                                            opacity: isDisabled ? 0.8 : 1,
                                        },
                                    ]}
                                    resizeMode="contain"
                                />
                            )
                        ) : null}

                        {renderLabel(tab.label, isActive, isDisabled)}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
