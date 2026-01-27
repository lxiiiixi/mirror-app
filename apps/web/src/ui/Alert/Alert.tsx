import { HTMLAttributes } from "react";
import "./Alert.css";

export type AlertVariant = "info" | "success" | "error";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
    open?: boolean;
    title?: string;
    message?: string;
    variant?: AlertVariant;
}

export function Alert({
    open = false,
    title,
    message,
    variant = "info",
    className = "",
    ...props
}: AlertProps) {
    const classes = [
        "alert",
        open ? "alert--open" : "",
        `alert--${variant}`,
        className,
    ]
        .filter(Boolean)
        .join(" ");

    if (!title && !message) {
        return null;
    }

    return (
        <div className={classes} role="status" {...props}>
            {title ? <p className="alert__title">{title}</p> : null}
            {message ? <p className="alert__message">{message}</p> : null}
        </div>
    );
}
