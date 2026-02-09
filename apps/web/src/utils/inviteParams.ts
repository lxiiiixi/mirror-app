/**
 * 邀请绑定：从 URL 解析 invite_uid（注册邀请）/ invite_code（作品邀请）并持久化到本地，
 * 在登录时带上对应参数，成功后清除，避免重复使用。
 */

const PENDING_INVITE_UID_KEY = "mirror_pending_invite_uid";
const PENDING_WORK_INVITE_CODE_KEY = "mirror_pending_work_invite_code";

export interface PendingInviteParams {
    /** 注册邀请：URL 中的 invite_uid，登录时传 invite_uid_code */
    inviteUid: string | null;
    /** 作品邀请：URL 中的 invite_code，登录时传 work_invite_code */
    workInviteCode: string | null;
}

function getStorage(): Storage | null {
    return typeof window !== "undefined" ? window.localStorage : null;
}

/**
 * 根据当前 URL search 写入待使用的邀请参数（仅当 URL 中有时才写入，避免覆盖已有缓存）
 */
export function persistInviteParamsFromSearch(search: string): void {
    const storage = getStorage();
    if (!storage) return;
    const params = new URLSearchParams(search);
    const inviteUid = params.get("invite_uid")?.trim() ?? "";
    const inviteCode = params.get("invite_code")?.trim() ?? "";
    if (inviteUid) storage.setItem(PENDING_INVITE_UID_KEY, inviteUid);
    if (inviteCode) storage.setItem(PENDING_WORK_INVITE_CODE_KEY, inviteCode);
}

/**
 * 读取当前待使用的邀请参数（登录时带上）
 */
export function getPendingInviteParams(): PendingInviteParams {
    const storage = getStorage();
    if (!storage) {
        return { inviteUid: null, workInviteCode: null };
    }
    return {
        inviteUid: storage.getItem(PENDING_INVITE_UID_KEY),
        workInviteCode: storage.getItem(PENDING_WORK_INVITE_CODE_KEY),
    };
}

/**
 * 登录成功后调用，清除待使用的邀请参数，避免下次登录重复使用
 */
export function clearPendingInviteParams(): void {
    const storage = getStorage();
    if (!storage) return;
    storage.removeItem(PENDING_INVITE_UID_KEY);
    storage.removeItem(PENDING_WORK_INVITE_CODE_KEY);
}
