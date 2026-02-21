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
  invite_uid?: MaybeParam;
  invite_code?: MaybeParam;
}): Promise<void> {
  const inviteUid = normalizeParam(params.invite_uid);
  const inviteCode = normalizeParam(params.invite_code);

  if (inviteUid) {
    await setStorageItem(STORAGE_KEYS.pendingInviteUid, inviteUid);
  }

  if (inviteCode) {
    await setStorageItem(STORAGE_KEYS.pendingWorkInviteCode, inviteCode);
  }
}

export async function getPendingInviteParams(): Promise<PendingInviteParams> {
  const [inviteUid, workInviteCode] = await Promise.all([
    getStorageItem(STORAGE_KEYS.pendingInviteUid),
    getStorageItem(STORAGE_KEYS.pendingWorkInviteCode),
  ]);

  return {
    inviteUid,
    workInviteCode,
  };
}

export async function clearPendingInviteParams(): Promise<void> {
  await Promise.all([
    removeStorageItem(STORAGE_KEYS.pendingInviteUid),
    removeStorageItem(STORAGE_KEYS.pendingWorkInviteCode),
  ]);
}
