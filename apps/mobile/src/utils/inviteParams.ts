import { STORAGE_KEYS, getStorageItem, removeStorageItem, setStorageItem } from "./localStorage";

export interface PendingInviteParams {
  inviteUid: string | null;
  workInviteCode: string | null;
}

type MaybeParam = string | string[] | undefined;

const normalizeParam = (value: MaybeParam): string => {
  if (Array.isArray(value)) {
    return (value[0] ?? "").trim();
  }
  return (value ?? "").trim();
};

export async function persistInviteParams(params: {
  club_invite?: MaybeParam;
  invite_code?: MaybeParam;
}): Promise<void> {
  const clubInvite = normalizeParam(params.club_invite);
  const inviteCode = normalizeParam(params.invite_code);

  if (clubInvite) {
    await Promise.all([
      setStorageItem(STORAGE_KEYS.clubInvite, clubInvite),
      setStorageItem(STORAGE_KEYS.pendingInviteUid, clubInvite),
    ]);
  }

  if (inviteCode) {
    await setStorageItem(STORAGE_KEYS.pendingWorkInviteCode, inviteCode);
  }
}

export async function getPendingInviteParams(): Promise<PendingInviteParams> {
  const [pendingInviteUid, clubInvite, workInviteCode] = await Promise.all([
    getStorageItem(STORAGE_KEYS.pendingInviteUid),
    getStorageItem(STORAGE_KEYS.clubInvite),
    getStorageItem(STORAGE_KEYS.pendingWorkInviteCode),
  ]);
  const inviteUid =
    pendingInviteUid && clubInvite && pendingInviteUid === clubInvite
      ? pendingInviteUid
      : null;

  // Historical compatibility: clear stale pendingInviteUid values not derived from club_invite.
  if (pendingInviteUid && !inviteUid) {
    await removeStorageItem(STORAGE_KEYS.pendingInviteUid);
  }

  return {
    inviteUid,
    workInviteCode,
  };
}

export async function clearPendingInviteUid(): Promise<void> {
  await removeStorageItem(STORAGE_KEYS.pendingInviteUid);
}

export async function clearPendingWorkInviteCode(): Promise<void> {
  await removeStorageItem(STORAGE_KEYS.pendingWorkInviteCode);
}

export async function clearPendingInviteParams(): Promise<void> {
  await Promise.all([clearPendingInviteUid(), clearPendingWorkInviteCode()]);
}
