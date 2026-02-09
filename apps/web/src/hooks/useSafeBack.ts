import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

type SafeBackOptions = {
    fallback?: string;
    replace?: boolean;
};

export function useSafeBack(options: SafeBackOptions = {}) {
    const { fallback = "/", replace = true } = options;
    const navigate = useNavigate();

    return useCallback(() => {
        if (typeof window === "undefined") {
            navigate(fallback, { replace });
            return;
        }

        const state = window.history.state as { idx?: number } | null;
        if (typeof state?.idx === "number") {
            if (state.idx > 0) {
                navigate(-1);
                return;
            }
            navigate(fallback, { replace });
            return;
        }

        try {
            if (document.referrer) {
                const referrer = new URL(document.referrer);
                if (referrer.origin === window.location.origin) {
                    navigate(-1);
                    return;
                }
            }
        } catch {
            // ignore malformed referrer
        }

        navigate(fallback, { replace });
    }, [fallback, navigate, replace]);
}
