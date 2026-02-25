/**
 * 邀请绑定：
 * - 登录邀请码：仅 URL 中的 club_invite 持久化到本地，登录时传 invite_uid_code
 * - 作品邀请码：URL 中的 invite_code 并持久化到本地，签到时传 signIn invite_code
 */

import { STORAGE_KEYS, getStorage } from "./localStorage";

export interface PendingInviteParams {
    /** 登录邀请码：仅来自 club_invite；登录时传 invite_uid_code */
    inviteUid: string | null;
    /** 作品邀请：URL 中的 invite_code，签到时传 signIn invite_code */
    workInviteCode: string | null;
}

/**
 * 根据当前 URL search 写入待使用的邀请参数（仅当 URL 中有时才写入，避免覆盖已有缓存）
 */
export function persistInviteParamsFromSearch(search: string): void {
    const storage = getStorage();
    if (!storage) return;
    const params = new URLSearchParams(search);
    const clubInvite = params.get("club_invite")?.trim() ?? "";
    const inviteCode = params.get("invite_code")?.trim() ?? "";

    // 登录邀请码只接受 club_invite，避免遗留 invite_uid（用户ID）被当作 invite_uid_code 透传。
    if (clubInvite) storage.setItem(STORAGE_KEYS.clubInvite, clubInvite);
    if (clubInvite) storage.setItem(STORAGE_KEYS.pendingInviteUid, clubInvite);
    if (inviteCode) storage.setItem(STORAGE_KEYS.pendingWorkInviteCode, inviteCode);
}

/**
 * 读取当前待使用的邀请参数
 */
export function getPendingInviteParams(): PendingInviteParams {
    const storage = getStorage();
    if (!storage) {
        return { inviteUid: null, workInviteCode: null };
    }

    const pendingInviteUid = storage.getItem(STORAGE_KEYS.pendingInviteUid);
    const clubInvite = storage.getItem(STORAGE_KEYS.clubInvite);
    // 兼容清理：若 pendingInviteUid 不是由 club_invite 建立（如历史遗留 invite_uid），则不再使用并清掉。
    const inviteUid =
        pendingInviteUid && clubInvite && pendingInviteUid === clubInvite ? pendingInviteUid : null;
    if (pendingInviteUid && !inviteUid) {
        storage.removeItem(STORAGE_KEYS.pendingInviteUid);
    }

    return {
        inviteUid,
        workInviteCode: storage.getItem(STORAGE_KEYS.pendingWorkInviteCode),
    };
}

/**
 * 登录成功后调用：清除待使用的用户邀请参数
 */
export function clearPendingInviteUid(): void {
    const storage = getStorage();
    if (!storage) return;
    storage.removeItem(STORAGE_KEYS.pendingInviteUid);
}

/**
 * 作品签到成功后调用：清除待使用的作品邀请码
 */
export function clearPendingWorkInviteCode(): void {
    const storage = getStorage();
    if (!storage) return;
    storage.removeItem(STORAGE_KEYS.pendingWorkInviteCode);
}

/**
 * 清除所有待使用的邀请参数（兼容旧调用）
 */
export function clearPendingInviteParams(): void {
    const storage = getStorage();
    if (!storage) return;
    storage.removeItem(STORAGE_KEYS.pendingInviteUid);
    storage.removeItem(STORAGE_KEYS.pendingWorkInviteCode);
}
