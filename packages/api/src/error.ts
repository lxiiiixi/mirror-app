export const API_ERROR_CODES = {
    SEND_EMAIL_CODE_TOO_FREQUENT: 503,
    WORK_SIGN_IN_DAILY_LIMIT_REACHED: 20054,
    INVALID_INVITE_UID_CODE: 30013,
} as const

export const getApiErrorCode = (error: unknown): number | null => {
    if (!error || typeof error !== 'object') return null
    const rawCode = (error as { code?: unknown }).code
    const code = Number(rawCode)
    return Number.isFinite(code) ? code : null
}

export const isApiErrorCode = (error: unknown, expectedCode: number): boolean =>
    getApiErrorCode(error) === expectedCode
