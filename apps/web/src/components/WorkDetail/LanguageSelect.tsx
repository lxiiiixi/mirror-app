import { useEffect, useRef, useState } from "react";
import { ChevronUp, Check } from "lucide-react";
import {
    getLanguageOptions,
    type LanguageSelectValue,
} from "./languageSelectUtils";

export type { LanguageSelectValue } from "./languageSelectUtils";

export interface LanguageSelectProps {
    value?: LanguageSelectValue;
    onValueChange?: (value: LanguageSelectValue) => void;
    /** 仅展示有内容的语言；不传则展示 zh / en / zh_hant */
    availableLanguages?: LanguageSelectValue[];
    className?: string;
}

export function LanguageSelect({
    value: controlledValue,
    onValueChange,
    availableLanguages,
    className = "",
}: LanguageSelectProps) {
    const [open, setOpen] = useState(false);
    const [internalValue, setInternalValue] = useState<LanguageSelectValue>("zh");
    const ref = useRef<HTMLDivElement>(null);

    const options = getLanguageOptions(availableLanguages);
    const value = controlledValue ?? internalValue;
    const setValue = (v: LanguageSelectValue) => {
        if (controlledValue === undefined) setInternalValue(v);
        onValueChange?.(v);
    };

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        window.addEventListener("mousedown", handleClickOutside);
        return () => window.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const selectedLabel = options.find(o => o.value === value)?.label ?? "中文";

    return (
        <div id="language-select" ref={ref} className={`relative ${className}`.trim()}>
            <button
                type="button"
                onClick={() => setOpen(prev => !prev)}
                className="flex items-center justify-center gap-0.5 rounded-md border border-white/70 px-2 py-1 text-[11px] text-white shadow-sm"
            >
                <span>{selectedLabel}</span>
                <ChevronUp
                    className={`h-3 w-3 shrink-0 transition-transform ${open ? "" : "rotate-180"}`}
                    strokeWidth={2}
                />
            </button>
            {open ? (
                <div className="absolute right-0 top-full z-10 mt-0.5 min-w-[90px] rounded-md border border-white/30 bg-white/20 py-1 shadow-lg backdrop-blur-[20px]">
                    {options.map(opt => {
                        const isSelected = opt.value === value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    setValue(opt.value);
                                    setOpen(false);
                                }}
                                className="flex w-full items-center justify-between gap-1.5 px-2 py-1.5 text-left text-[11px] text-white hover:bg-white/15"
                            >
                                <span>{opt.label}</span>
                                {isSelected ? (
                                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white/70">
                                        <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
                                    </span>
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}
