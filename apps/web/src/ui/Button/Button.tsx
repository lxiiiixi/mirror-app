import { ButtonHTMLAttributes, forwardRef } from "react";
import "./button.css";

export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "x-small" | "small" | "medium" | "large";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * 按钮变体
     * - primary: 主题色按钮 (#EB1484)
     * - secondary: 半透明灰色按钮
     */
    variant?: ButtonVariant;

    /**
     * 按钮尺寸
     */
    size?: ButtonSize;

    /**
     * 是否为圆角按钮
     */
    rounded?: boolean;

    /**
     * 是否全宽
     */
    fullWidth?: boolean;

    /**
     * 按钮内容
     */
    children: React.ReactNode;
}

/**
 * Button 组件
 * 纯 UI 组件，不包含业务逻辑
 * 使用 Tailwind CSS 实现样式
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = "primary",
            size = "medium",
            rounded = false,
            fullWidth = false,
            disabled = false,
            className = "",
            children,
            ...props
        },
        ref,
    ) => {
        const sizeClassMap: Record<ButtonSize, string> = {
            "x-small": "btn-xs",
            small: "btn-sm",
            medium: "btn-md",
            large: "btn-lg",
        };

        const classes = [
            "btn",
            `btn-${variant}`,
            sizeClassMap[size],
            rounded ? "btn-rounded" : "",
            fullWidth ? "btn-full" : "",
            className,
        ]
            .filter(Boolean)
            .join(" ");

        return (
            <button ref={ref} className={classes} disabled={disabled} type="button" {...props}>
                {children}
            </button>
        );
    },
);

Button.displayName = "Button";
