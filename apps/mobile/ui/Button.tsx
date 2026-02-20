import { Children, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "x-small" | "small" | "medium" | "large";

export interface ButtonProps extends Omit<PressableProps, "style" | "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  rounded?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
  "x-small": {
    container: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4, minHeight: 24 },
    text: { fontSize: 12, lineHeight: 14 },
  },
  small: {
    container: { paddingVertical: 6, paddingHorizontal: 15, borderRadius: 4, minHeight: 28 },
    text: { fontSize: 14, lineHeight: 16 },
  },
  medium: {
    container: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 4, minHeight: 34 },
    text: { fontSize: 16, lineHeight: 18 },
  },
  large: {
    container: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, minHeight: 44 },
    text: { fontSize: 16, lineHeight: 22 },
  },
};

export function Button({
  variant = "primary",
  size = "medium",
  rounded = false,
  fullWidth = false,
  disabled = false,
  style,
  textStyle,
  children,
  ...props
}: ButtonProps) {
  const sizeStyle = sizeStyles[size];
  const baseVariantStyle = variant === "primary" ? styles.primary : styles.secondary;
  const pressedVariantStyle =
    variant === "primary" ? styles.primaryPressed : styles.secondaryPressed;
  const baseTextStyle = variant === "primary" ? styles.primaryText : styles.secondaryText;
  const childArray = Children.toArray(children);
  const textStyles: StyleProp<TextStyle> = [
    styles.textBase,
    sizeStyle.text,
    baseTextStyle,
    textStyle,
  ];
  const shouldWrapWithText =
    childArray.length > 0 &&
    childArray.every((child) => typeof child === "string" || typeof child === "number");

  const renderContent = shouldWrapWithText ? (
    <Text style={textStyles}>{children}</Text>
  ) : (
    childArray.map((child, index) =>
      typeof child === "string" || typeof child === "number" ? (
        <Text key={`button-text-${index}`} style={textStyles}>
          {child}
        </Text>
      ) : (
        child
      ),
    )
  );

  return (
    <Pressable
      {...props}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        baseVariantStyle,
        sizeStyle.container,
        rounded && styles.rounded,
        fullWidth && styles.fullWidth,
        pressed && !disabled && styles.pressedBase,
        pressed && !disabled && pressedVariantStyle,
        disabled && styles.disabled,
        style,
      ]}
    >
      {renderContent}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 10,
  },
  textBase: {
    fontWeight: "600",
  },
  primary: {
    backgroundColor: "#eb1484",
  },
  primaryPressed: {
    backgroundColor: "#cf0f72",
  },
  primaryText: {
    color: "#ffffff",
  },
  secondary: {
    backgroundColor: "rgba(15, 23, 42, 0.78)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.55)",
  },
  secondaryPressed: {
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    borderColor: "rgba(148, 163, 184, 0.72)",
  },
  secondaryText: {
    color: "#ffffff",
  },
  rounded: {
    borderRadius: 9999,
  },
  fullWidth: {
    width: "100%",
  },
  pressedBase: {
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
