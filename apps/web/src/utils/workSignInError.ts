export const WORK_SIGN_IN_DAILY_LIMIT_CODE = 20054;

const getErrorCode = (error: unknown): number | null => {
    if (!error || typeof error !== "object") return null;
    const rawCode = (error as { code?: unknown }).code;
    const code = Number(rawCode);
    return Number.isFinite(code) ? code : null;
};

export const isWorkSignInDailyLimitError = (error: unknown): boolean =>
    getErrorCode(error) === WORK_SIGN_IN_DAILY_LIMIT_CODE;
