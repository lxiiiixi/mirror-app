import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { persistInviteParamsFromSearch } from "../utils/inviteParams";

/**
 * 每次进入应用/路由变化时，若 URL 带有 invite_uid 或 invite_code，
 * 则写入本地缓存，供登录时读取并带上；登录成功后由调用方清除。
 * 应在 App 根组件中调用。
 */
export function usePersistInviteParams() {
    const location = useLocation();

    useEffect(() => {
        persistInviteParamsFromSearch(location.search);
    }, [location.search]);
}
