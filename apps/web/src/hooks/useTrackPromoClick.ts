import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { artsApiClient } from "../api/artsClient";

/**
 * 推广链接点击统计：当应用加载时，若当前 URL 带有 invite_uid 或 invite_code，
 * 向服务端上报一次（GET /arts/work/track），用于统计邀请带来的访问。
 * 建议在 App 根组件中调用，保证首屏加载即判断。
 */
export function useTrackPromoClick() {
    const location = useLocation();
    const hasTrackedRef = useRef(false);

    useEffect(() => {
        if (hasTrackedRef.current) return;
        const params = new URLSearchParams(location.search);
        const inviteUid = params.get("invite_uid") ?? "";
        const inviteCode = params.get("invite_code") ?? "";
        if (!inviteUid && !inviteCode) return;
        hasTrackedRef.current = true;
        artsApiClient.work
            .trackPromoClick({
                promo_code: inviteCode || inviteUid || undefined,
            })
            .catch(() => {});
    }, [location.search]);
}
