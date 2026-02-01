import type { HTMLAttributes } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import "./select.css";
import { SelectOptions, type SelectOptionItem } from "./SelectOptions";

export type SelectSize = "sm" | "md" | "lg";

export interface SelectProps extends HTMLAttributes<HTMLDivElement> {
    value?: string;
    placeholder?: string;
    options: SelectOptionItem[];
    size?: SelectSize;
    disabled?: boolean;
    onValueChange?: (value: string) => void;
}

export function Select({
    value,
    placeholder,
    options,
    size = "md",
    disabled = false,
    onValueChange,
    className = "",
    ...props
}: SelectProps) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);

    const selectedOption = useMemo(
        () => options.find(option => option.value === value),
        [options, value],
    );

    useEffect(() => {
        if (!open) return;

        const handleClick = (event: MouseEvent) => {
            const target = event.target as Node | null;
            if (!rootRef.current || !target) return;
            if (!rootRef.current.contains(target)) {
                setOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setOpen(false);
            }
        };

        window.addEventListener("mousedown", handleClick);
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("mousedown", handleClick);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    const handleToggle = () => {
        if (disabled) return;
        setOpen(prev => !prev);
    };

    const handleSelect = (nextValue: string) => {
        if (disabled) return;
        onValueChange?.(nextValue);
        setOpen(false);
    };

    const sizeClass = `select-${size}`;
    const triggerLabel = selectedOption?.label ?? "";
    const triggerIcon = selectedOption?.iconSrc;

    return (
        <div
            ref={rootRef}
            className={`select-root ${sizeClass} ${disabled ? "is-disabled" : ""} ${className}`.trim()}
            {...props}
        >
            <button
                type="button"
                className={`select-trigger ${open ? "is-open" : ""}`.trim()}
                onClick={handleToggle}
                disabled={disabled}
            >
                <span className={`select-value ${!triggerLabel ? "is-placeholder" : ""}`.trim()}>
                    {triggerIcon ? <img className="select-icon" src={triggerIcon} alt="" /> : null}
                    {triggerLabel || placeholder}
                </span>
                <span className="select-caret" aria-hidden="true" />
            </button>

            <SelectOptions
                open={open}
                options={options}
                selectedValue={value}
                onSelect={handleSelect}
            />
        </div>
    );
}
