import type { HTMLAttributes } from "react";
import "./select.css";

export interface SelectOptionItem {
    value: string;
    label: string;
    iconSrc?: string;
    disabled?: boolean;
}

export interface SelectOptionsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
    open: boolean;
    options: SelectOptionItem[];
    selectedValue?: string;
    onSelect: (value: string) => void;
}

export function SelectOptions({
    open,
    options,
    selectedValue,
    onSelect,
    className = "",
    ...props
}: SelectOptionsProps) {
    if (!open) return null;

    return (
        <div className={`select-options ${className}`.trim()} {...props}>
            {options.map(option => {
                const isSelected = option.value === selectedValue;
                return (
                    <button
                        key={option.value}
                        type="button"
                        className={`select-option ${isSelected ? "is-selected" : ""}`.trim()}
                        onClick={() => {
                            if (option.disabled) return;
                            onSelect(option.value);
                        }}
                        disabled={option.disabled}
                    >
                        {option.iconSrc ? (
                            <img className="option-icon" src={option.iconSrc} alt="" />
                        ) : null}
                        <span className="option-label">{option.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
