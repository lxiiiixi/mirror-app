import { getStorageItem, removeStorageItem, setStorageItem } from "./storage";

export const STORAGE_KEYS = {
  token: "userToken",
  tokenExpiry: "timestamp",
  loginMethod: "loginMethod",
  userLang: "user-lang",
  skipWhitepaperRedirect: "skip-whitepaper-redirect",
  clubInvite: "club_invite",
  vipMiningTab: "su",
  pendingInviteUid: "mirror_pending_invite_uid",
  pendingWorkInviteCode: "mirror_pending_work_invite_code",
} as const;

export { getStorageItem, removeStorageItem, setStorageItem };
