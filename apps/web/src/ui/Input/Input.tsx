import { forwardRef, InputHTMLAttributes } from "react";

export type InputSize = "sm" | "md" | "lg";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    inputSize?: InputSize;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ inputSize = "md", className = "", ...props }, ref) => {
        const classes = ["input", `input-${inputSize}`, className]
            .filter(Boolean)
            .join(" ");

        return <input ref={ref} className={classes} {...props} />;
    }
);

Input.displayName = "Input";
