import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { STORAGE_KEYS, setStorageItem } from "../../utils/localStorage";

const LANGUAGES = [
    { value: "en", label: "English" },
    { value: "zh-HK", label: "繁體" },
    { value: "zh-CN", label: "简体" },
] as const;

export interface LanguageSelectProps {
    className?: string;
    langIconSrc?: string;
}

export function LanguageSelect({ className = "", langIconSrc }: LanguageSelectProps) {
    const { i18n } = useTranslation();
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const currentLanguage = i18n.resolvedLanguage ?? i18n.language ?? "en";
    const currentOption = LANGUAGES.find(
        opt => opt.value.toLowerCase() === currentLanguage.toLowerCase(),
    ) ?? LANGUAGES[0];

    const handleSelect = useCallback(
        (value: string) => {
            setStorageItem(STORAGE_KEYS.userLang, value);
            void i18n.changeLanguage(value);
            setOpen(false);
        },
        [i18n],
    );

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    return (
        <div ref={containerRef} className={`relative inline-flex ${className}`.trim()}>
            <button
                type="button"
                className="inline-flex items-center justify-center gap-[5px] h-[27px] px-2 rounded border-none bg-transparent text-inherit text-[12px] font-bold cursor-pointer hover:bg-white/10"
                onClick={() => setOpen(prev => !prev)}
                aria-expanded={open}
                aria-haspopup="listbox"
                aria-label="Select language"
            >
                {langIconSrc ? (
                    <img
                        className="w-4 h-4 shrink-0"
                        src={langIconSrc}
                        alt=""
                        aria-hidden="true"
                    />
                ) : (
                    <svg
                        className="w-4 h-4 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                )}
                <span className="whitespace-nowrap">{currentOption.label}</span>
                <svg
                    className={`w-3.5 h-3.5 shrink-0 opacity-80 transition-transform duration-200 ease-in-out ${open ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>
            {open ? (
                <ul
                    className="absolute top-full left-0 mt-1 py-1 min-w-[120px] list-none bg-[rgb(18,9,44)]/95 border border-white/10 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.3)] z-100"
                    role="listbox"
                    aria-label="Language options"
                >
                    {LANGUAGES.map(opt => (
                        <li key={opt.value} role="option" aria-selected={currentOption.value === opt.value}>
                            <button
                                type="button"
                                className={`block w-full px-3 py-2 border-none bg-transparent text-white text-sm font-medium text-left cursor-pointer hover:bg-white/10 ${
                                    currentOption.value === opt.value
                                        ? "bg-[rgba(255,38,150,0.2)] text-[rgb(255,38,150)]"
                                        : ""
                                }`}
                                onClick={() => handleSelect(opt.value)}
                            >
                                {opt.label}
                            </button>
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    );
}
