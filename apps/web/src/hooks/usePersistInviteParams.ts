import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { persistInviteParamsFromSearch } from "../utils/inviteParams";

/**
 * 每次进入应用/路由变化时，若 URL 带有 club_invite 或 invite_code，
 * 则写入本地缓存：club_invite 供登录时读取，invite_code 供签到时读取。
 * 应在 App 根组件中调用。
 */
export function usePersistInviteParams() {
    const location = useLocation();

    useEffect(() => {
        persistInviteParamsFromSearch(location.search);
    }, [location.search]);
}
