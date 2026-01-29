import type * as Types from "./types";

export type ArtsApiLanguage = "en" | "zh-Hant" | "zh-CN" | "zh-TW" | string;

export type ArtsApiErrorType = "client" | "network" | "http" | "parse" | "business";

export interface ArtsApiError {
    type: ArtsApiErrorType;
    code: number;
    message: string;
    status?: number;
    data?: unknown;
    url: string;
    method: string;
}

export interface ArtsApiErrorInput {
    type: ArtsApiErrorType;
    code?: number;
    message: string;
    status?: number;
    data?: unknown;
    url: string;
    method: string;
    response?: Types.ApiResponse<unknown>;
    raw?: unknown;
}

export type ArtsApiErrorFormatter<E = ArtsApiError> = (input: ArtsApiErrorInput) => E;

export interface ArtsApiClientOptions<E = ArtsApiError> {
    baseUrl: string;
    token?: string;
    language?: ArtsApiLanguage;
    timeoutMs?: number;
    errorFormatter?: ArtsApiErrorFormatter<E>;
}

type AuthMode = "required" | "optional" | "none";

type QueryValue = string | number | boolean | null | undefined;

type QueryParams = Record<string, QueryValue | QueryValue[]>;
type QueryInput = object;

interface RequestOptions {
    auth?: AuthMode;
    query?: QueryInput;
    body?: unknown;
    formData?: FormData;
    headers?: Record<string, string>;
    language?: ArtsApiLanguage;
}

export const defaultArtsApiErrorFormatter = (input: ArtsApiErrorInput): ArtsApiError => {
    return {
        type: input.type,
        code: input.code ?? input.status ?? -1,
        message: input.message,
        status: input.status,
        data: input.data ?? input.response ?? input.raw,
        url: input.url,
        method: input.method,
    };
};

export class ArtsApiClient<E = ArtsApiError> {
    private baseUrl: string;
    private token?: string;
    private language?: ArtsApiLanguage;
    private timeoutMs?: number;
    private errorFormatter: ArtsApiErrorFormatter<E>;

    public readonly user: ReturnType<typeof createUserModule<E>>;
    public readonly work: ReturnType<typeof createWorkModule<E>>;
    public readonly file: ReturnType<typeof createFileModule<E>>;
    public readonly static: ReturnType<typeof createStaticModule<E>>;
    public readonly node: ReturnType<typeof createNodeModule<E>>;
    public readonly deposit: ReturnType<typeof createDepositModule<E>>;
    public readonly ticket: ReturnType<typeof createTicketModule<E>>;
    public readonly consignment: ReturnType<typeof createConsignmentModule<E>>;
    public readonly channel: ReturnType<typeof createChannelModule<E>>;
    public readonly health: ReturnType<typeof createHealthModule<E>>;
    public readonly admin: ReturnType<typeof createAdminModule<E>>;

    constructor(options: ArtsApiClientOptions<E>) {
        this.baseUrl = normalizeBaseUrl(options.baseUrl);
        this.token = options.token;
        this.language = options.language;
        this.timeoutMs = options.timeoutMs;
        this.errorFormatter = (options.errorFormatter ??
            defaultArtsApiErrorFormatter) as ArtsApiErrorFormatter<E>;

        this.user = createUserModule(this);
        this.work = createWorkModule(this);
        this.file = createFileModule(this);
        this.static = createStaticModule(this);
        this.node = createNodeModule(this);
        this.deposit = createDepositModule(this);
        this.ticket = createTicketModule(this);
        this.consignment = createConsignmentModule(this);
        this.channel = createChannelModule(this);
        this.health = createHealthModule(this);
        this.admin = createAdminModule(this);
    }

    setToken(token?: string) {
        this.token = token;
    }

    getToken() {
        return this.token;
    }

    setLanguage(language?: ArtsApiLanguage) {
        this.language = language;
    }

    getLanguage() {
        return this.language;
    }

    setBaseUrl(baseUrl?: string) {
        this.baseUrl = normalizeBaseUrl(baseUrl);
    }

    getBaseUrl() {
        return this.baseUrl;
    }

    setTimeout(timeoutMs?: number) {
        this.timeoutMs = timeoutMs;
    }

    public async requestJson<T>(
        method: string,
        path: string,
        options: RequestOptions = {},
    ): Promise<Types.ApiResponse<T>> {
        const response = await this.performFetch(method, path, options);

        if (!response.ok) {
            const error = await this.buildHttpError(method, path, response);
            throw error;
        }

        const text = await response.text();
        let payload: unknown;
        try {
            payload = text ? JSON.parse(text) : null;
        } catch (err) {
            throw this.formatError({
                type: "parse",
                message: "Failed to parse JSON response",
                url: response.url,
                method,
                status: response.status,
                raw: text,
            });
        }

        if (!isApiResponse(payload)) {
            throw this.formatError({
                type: "parse",
                message: "Response is not a valid API envelope",
                url: response.url,
                method,
                status: response.status,
                raw: payload,
            });
        }

        if (payload.code !== 0) {
            throw this.formatError({
                type: "business",
                code: payload.code,
                message: payload.msg || "Business error",
                url: response.url,
                method,
                status: response.status,
                data: payload.data,
                response: payload,
            });
        }

        return payload as Types.ApiResponse<T>;
    }

    public async requestBinary(
        method: string,
        path: string,
        options: RequestOptions = {},
    ): Promise<Blob> {
        const response = await this.performFetch(method, path, options);

        if (!response.ok) {
            const error = await this.buildHttpError(method, path, response);
            throw error;
        }

        return await response.blob();
    }

    public async requestResponse(
        method: string,
        path: string,
        options: RequestOptions = {},
    ): Promise<Response> {
        const response = await this.performFetch(method, path, options);

        if (!response.ok) {
            const error = await this.buildHttpError(method, path, response);
            throw error;
        }

        return response;
    }

    private async performFetch(
        method: string,
        path: string,
        options: RequestOptions = {},
    ): Promise<Response> {
        const url = buildUrl(this.baseUrl, path, options.query);
        const headers = new Headers(options.headers ?? {});
        const authMode = options.auth ?? "optional";

        if (authMode === "required" && !this.token) {
            throw this.formatError({
                type: "client",
                message: "Token is required but missing",
                url,
                method,
            });
        }

        if (authMode !== "none" && this.token) {
            headers.set("Token", this.token);
        }

        const language = options.language ?? this.language;
        if (language) {
            headers.set("Accept-Language", language);
        }

        let body: BodyInit | undefined;
        if (options.formData) {
            body = options.formData;
        } else if (options.body !== undefined) {
            headers.set("Content-Type", "application/json");
            body = JSON.stringify(options.body);
        }

        const controller = this.timeoutMs ? new AbortController() : undefined;
        const timeoutId = this.timeoutMs
            ? setTimeout(() => controller?.abort(), this.timeoutMs)
            : undefined;

        try {
            console.log(`🛜 [ArtsApiClient] ${method} => ${url}`);
            return await fetch(url, {
                method,
                headers,
                body,
                signal: controller?.signal,
            });
        } catch (err) {
            console.error(`🛜 [ArtsApiClient] Error: ${method} ${url}`, err);
            throw this.formatError({
                type: "network",
                message: err instanceof Error ? err.message : "Network error",
                url,
                method,
                raw: err,
            });
        } finally {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        }
    }

    private async buildHttpError(method: string, path: string, response: Response): Promise<E> {
        const url = response.url || buildUrl(this.baseUrl, path);
        const text = await response.text();
        let parsed: unknown;

        try {
            parsed = text ? JSON.parse(text) : null;
        } catch {
            parsed = null;
        }

        if (isApiResponse(parsed)) {
            return this.formatError({
                type: "http",
                code: parsed.code,
                message: parsed.msg || response.statusText || "HTTP error",
                url,
                method,
                status: response.status,
                data: parsed.data,
                response: parsed,
            });
        }

        return this.formatError({
            type: "http",
            code: response.status,
            message: response.statusText || "HTTP error",
            url,
            method,
            status: response.status,
            raw: text,
        });
    }

    private formatError(input: ArtsApiErrorInput): E {
        return this.errorFormatter(input);
    }

    public toFormData(file: Types.UploadFile | FormData, filename?: string): FormData {
        if (typeof FormData === "undefined") {
            throw this.formatError({
                type: "client",
                message: "FormData is not available in this environment",
                url: "FormData",
                method: "FORM",
            });
        }

        if (file instanceof FormData) {
            return file;
        }

        const form = new FormData();

        if (isReactNativeFile(file)) {
            form.append("file", {
                uri: file.uri,
                name: file.name ?? filename ?? "file",
                type: file.type,
            } as unknown as Blob);
            return form;
        }

        const blob = file as Blob;
        const name =
            filename ?? (typeof (file as File).name === "string" ? (file as File).name : undefined);

        if (name) {
            form.append("file", blob, name);
        } else {
            form.append("file", blob);
        }

        return form;
    }
}

function normalizeBaseUrl(baseUrl?: string) {
    if (!baseUrl) {
        return "";
    }

    return baseUrl.replace(/\/+$/, "");
}

function buildUrl(baseUrl: string, path: string, query?: QueryInput): string {
    let normalizedPath = path.startsWith("/") ? path : `/${path}`;
    if (baseUrl && normalizedPath.startsWith("/arts") && baseUrl.endsWith("/arts")) {
        normalizedPath = normalizedPath.slice("/arts".length) || "";
        if (normalizedPath && !normalizedPath.startsWith("/")) {
            normalizedPath = `/${normalizedPath}`;
        }
    }
    const url = baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
    const queryString = query ? buildQueryString(query) : "";
    return `${url}${queryString}`;
}

function buildQueryString(params: QueryInput): string {
    const searchParams = new URLSearchParams();
    const entries = Object.entries(params as Record<string, unknown>);

    entries.forEach(([key, value]) => {
        if (value === undefined || value === null) {
            return;
        }

        if (Array.isArray(value)) {
            value.forEach(entry => {
                if (entry === undefined || entry === null) {
                    return;
                }
                searchParams.append(key, String(entry));
            });
            return;
        }

        searchParams.append(key, String(value));
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : "";
}

function isApiResponse(value: unknown): value is Types.ApiResponse<unknown> {
    if (!value || typeof value !== "object") {
        return false;
    }

    const record = value as { code?: unknown; msg?: unknown };
    return typeof record.code === "number" && typeof record.msg === "string";
}

function isReactNativeFile(
    value: Types.UploadFile,
): value is { uri: string; name?: string; type?: string } {
    return typeof value === "object" && value !== null && "uri" in value;
}

function encodePathSegment(value: string | number): string {
    return encodeURIComponent(String(value));
}

function encodePath(path: string): string {
    return path
        .split("/")
        .map(segment => encodeURIComponent(segment))
        .join("/");
}

function createUserModule<E>(client: ArtsApiClient<E>) {
    return {
        solanaWalletLogin: (payload: Types.UserSolanaWalletLoginRequest) =>
            client.requestJson<Types.UserSolanaWalletLoginResponseData>(
                "POST",
                "/arts/user/solanaWalletLogin",
                { auth: "none", body: payload },
            ),
        emailLogin: (payload: Types.UserEmailLoginRequest) =>
            client.requestJson<Types.UserEmailLoginResponseData>("POST", "/arts/user/emailLogin", {
                auth: "none",
                body: payload,
            }),
        sendEmailCode: (payload: Types.UserSendEmailCodeRequest) =>
            client.requestJson<Types.UserSendEmailCodeResponseData>(
                "POST",
                "/arts/user/sendEmailCode",
                { auth: "none", body: payload },
            ),
        bindEmail: (payload: Types.UserBindEmailRequest) =>
            client.requestJson<Types.UserBindEmailResponseData>("POST", "/arts/user/bindEmail", {
                auth: "required",
                body: payload,
            }),
        bindWallet: (payload: Types.UserBindWalletRequest) =>
            client.requestJson<Types.UserBindWalletResponseData>("POST", "/arts/user/bindWallet", {
                auth: "required",
                body: payload,
            }),
        getAsset: () =>
            client.requestJson<Types.UserAssetResponseData>("GET", "/arts/user/asset", {
                auth: "required",
            }),
        getVipLevel: () =>
            client.requestJson<Types.UserVipLevelResponseData>("GET", "/arts/user/vipLevel", {
                auth: "required",
            }),
        getLevelProgress: () =>
            client.requestJson<Types.UserLevelProgressResponseData>(
                "GET",
                "/arts/user/levelProgress",
                { auth: "required" },
            ),
        checkLevelUpgrade: () =>
            client.requestJson<Types.UserCheckLevelUpgradeResponseData>(
                "POST",
                "/arts/user/checkLevelUpgrade",
                { auth: "required" },
            ),
        getCommissionHistory: (params: Types.UserCommissionHistoryParams = {}) =>
            client.requestJson<Types.UserCommissionHistoryResponseData>(
                "GET",
                "/arts/user/commissionHistory",
                { auth: "required", query: params },
            ),
        getWallets: () =>
            client.requestJson<Types.UserWalletsResponseData>("GET", "/arts/user/wallets", {
                auth: "required",
            }),
        getRegion: () =>
            client.requestJson<Types.UserRegionResponseData>("GET", "/arts/user/region", {
                auth: "none",
            }),
        checkWhitelist: () =>
            client.requestJson<Types.UserWhitelistResponseData>("GET", "/arts/user/check", {
                auth: "required",
            }),
        bindUser: (payload: Types.UserBindProfileRequest) =>
            client.requestJson<Types.UserBindProfileResponseData>("POST", "/arts/user/bind", {
                auth: "required",
                body: payload,
            }),
        getNodeCounts: () =>
            client.requestJson<Types.UserNodeCountsResponseData>(
                "GET",
                "/arts/user/getNodeCounts",
                { auth: "required" },
            ),
    };
}

function createWorkModule<E>(client: ArtsApiClient<E>) {
    return {
        list: (params: Types.WorkListParams = {}) =>
            client.requestJson<Types.WorkListResponseData>("GET", "/arts/work/list", {
                auth: "optional",
                query: params,
            }),
        detail: (params: Types.WorkDetailParams) =>
            client.requestJson<Types.WorkDetailResponseData>("GET", "/arts/work/detail", {
                auth: "optional",
                query: params,
            }),
        upload: (payload: Types.WorkUploadRequest) =>
            client.requestJson<Types.WorkUploadResponseData>("POST", "/arts/work/upload", {
                auth: "required",
                body: payload,
            }),
        standardUpload: (payload: Types.WorkStandardUploadRequest) =>
            client.requestJson<Types.WorkStandardUploadResponseData>(
                "POST",
                "/arts/work/standardUpload",
                { auth: "required", body: payload },
            ),
        update: (payload: Types.WorkUpdateRequest) =>
            client.requestJson<Types.WorkUpdateResponseData>("POST", "/arts/work/update", {
                auth: "required",
                body: payload,
            }),
        delete: (params: Types.WorkDeleteParams) =>
            client.requestJson<Types.WorkDeleteResponseData>("GET", "/arts/work/delete", {
                auth: "required",
                query: params,
            }),
        purchase: (payload: Types.WorkPurchaseRequest) =>
            client.requestJson<Types.WorkPurchaseResponseData>("POST", "/arts/work/purchase", {
                auth: "required",
                body: payload,
            }),
        getPaymentBalances: (params: Types.WorkPaymentBalancesParams) =>
            client.requestJson<Types.WorkPaymentBalancesResponseData>(
                "GET",
                "/arts/work/payment/balances",
                { auth: "required", query: params },
            ),
        getChapter: (params: Types.WorkChapterParams) =>
            client.requestJson<Types.WorkChapterResponseData>("GET", "/arts/work/chapter", {
                auth: "optional",
                query: params,
            }),
        action: (payload: Types.WorkActionRequest) =>
            client.requestJson<Types.WorkActionResponseData>("POST", "/arts/work/action", {
                auth: "required",
                body: payload,
            }),
        getHotList: (params: Types.WorkHotListParams = {}) =>
            client.requestJson<Types.WorkHotListResponseData>("GET", "/arts/work/hotList", {
                auth: "optional",
                query: params,
            }),
        getFinishedList: (params: Types.WorkFinishedListParams = {}) =>
            client.requestJson<Types.WorkFinishedListResponseData>(
                "GET",
                "/arts/work/finishedList",
                { auth: "required", query: params },
            ),
        signIn: (payload: Types.WorkSignInRequest) =>
            client.requestJson<Types.WorkSignInResponseData>("POST", "/arts/work/signIn", {
                auth: "required",
                body: payload,
            }),
        getTotal: (params: Types.WorkTotalParams) =>
            client.requestJson<Types.WorkTotalResponseData>("GET", "/arts/work/total", {
                auth: "required",
                query: params,
            }),
        share: (params: Types.WorkShareParams) =>
            client.requestJson<Types.WorkShareResponseData>("GET", "/arts/work/share", {
                auth: "required",
                query: params,
            }),
        getTokenInfo: (params: Types.WorkTokenInfoParams) =>
            client.requestJson<Types.WorkTokenInfoResponseData>("GET", "/arts/work/getTokenInfo", {
                auth: "optional",
                query: params,
            }),
        getActivityRewards: (params: Types.WorkActivityRewardsParams) =>
            client.requestJson<Types.WorkActivityRewardsResponseData>(
                "GET",
                "/arts/work/getActivityRewards",
                { auth: "required", query: params },
            ),
        watchVideo: (payload: Types.WorkWatchVideoRequest) =>
            client.requestJson<Types.WorkWatchVideoResponseData>("POST", "/arts/work/watchVideo", {
                auth: "required",
                body: payload,
            }),
        startIdo: (payload: Types.WorkStartIdoRequest) =>
            client.requestJson<Types.WorkStartIdoResponseData>("POST", "/arts/work/startIdo", {
                auth: "required",
                body: payload,
            }),
        queryIdoInfo: (payload: Types.WorkQueryIdoInfoRequest) =>
            client.requestJson<Types.WorkQueryIdoInfoResponseData>(
                "POST",
                "/arts/work/queryIdoInfo",
                { auth: "required", body: payload },
            ),
        createToken: (payload: Types.WorkCreateTokenRequest) =>
            client.requestJson<Types.WorkCreateTokenResponseData>(
                "POST",
                "/arts/work/createdToken",
                { auth: "required", body: payload },
            ),
        getTokenIdoList: (params: Types.WorkTokenIdoListParams = {}) =>
            client.requestJson<Types.WorkTokenIdoListResponseData>(
                "GET",
                "/arts/work/tokenIdoList",
                { auth: "optional", query: params },
            ),
        buyToken: (payload: Types.WorkBuyTokenRequest) =>
            client.requestJson<Types.WorkBuyTokenResponseData>("POST", "/arts/work/buyToken", {
                auth: "required",
                body: payload,
            }),
        getAirdropInfo: (payload: Types.WorkAirdropInfoRequest) =>
            client.requestJson<Types.WorkAirdropInfoResponseData>(
                "POST",
                "/arts/work/airdropInfo",
                { auth: "required", body: payload },
            ),
        unlockAirdrop: (payload: Types.WorkUnlockAirdropRequest) =>
            client.requestJson<Types.WorkUnlockAirdropResponseData>(
                "POST",
                "/arts/work/unlockAirDrop",
                { auth: "required", body: payload },
            ),
        uploadExternalLink: (payload: Types.WorkUploadExternalLinkRequest) =>
            client.requestJson<Types.WorkUploadExternalLinkResponseData>(
                "POST",
                "/arts/work/uploadExternalLink",
                { auth: "required", body: payload },
            ),
        getExternalLinks: (params: Types.WorkExternalLinkParams) =>
            client.requestJson<Types.WorkExternalLinkResponseData>(
                "GET",
                "/arts/work/externalLink",
                { auth: "optional", query: params },
            ),
        trackPromoClick: (params: Types.WorkTrackPromoParams = {}) =>
            client.requestJson<Types.WorkTrackPromoResponseData>("GET", "/arts/work/track", {
                auth: "none",
                query: params,
            }),
        getPromoStats: (params: Types.WorkPromoStatsParams = {}) =>
            client.requestJson<Types.WorkPromoStatsResponseData>("GET", "/arts/work/promoStats", {
                auth: "none",
                query: params,
            }),
        generateInviteCode: (payload: Types.WorkGenerateInviteCodeRequest) =>
            client.requestJson<Types.WorkGenerateInviteCodeResponseData>(
                "POST",
                "/arts/work/generateInviteCode",
                { auth: "required", body: payload },
            ),
        parseInviteCode: (params: Types.WorkParseInviteCodeParams) =>
            client.requestJson<Types.WorkParseInviteCodeResponseData>(
                "GET",
                "/arts/work/parseInviteCode",
                { auth: "none", query: params },
            ),
        validateInviteCode: (params: Types.WorkValidateInviteCodeParams) =>
            client.requestJson<Types.WorkValidateInviteCodeResponseData>(
                "GET",
                "/arts/work/validateInviteCode",
                { auth: "none", query: params },
            ),
        getMyInviteCodes: (params: Types.WorkMyInviteCodesParams = {}) =>
            client.requestJson<Types.WorkMyInviteCodesResponseData>(
                "GET",
                "/arts/work/myInviteCodes",
                { auth: "required", query: params },
            ),
        getInviteStats: () =>
            client.requestJson<Types.WorkInviteStatsResponseData>("GET", "/arts/work/inviteStats", {
                auth: "required",
            }),
        getTopInviters: (params: Types.WorkTopInvitersParams) =>
            client.requestJson<Types.WorkTopInvitersResponseData>("GET", "/arts/work/topInviters", {
                auth: "none",
                query: params,
            }),
        getWorkInviteCodes: (params: Types.WorkInviteCodesParams) =>
            client.requestJson<Types.WorkInviteCodesResponseData>(
                "GET",
                "/arts/work/workInviteCodes",
                { auth: "none", query: params },
            ),
        disableInviteCode: (payload: Types.WorkDisableInviteCodeRequest) =>
            client.requestJson<Types.WorkDisableInviteCodeResponseData>(
                "POST",
                "/arts/work/disableInviteCode",
                { auth: "required", body: payload },
            ),
        enableInviteCode: (payload: Types.WorkEnableInviteCodeRequest) =>
            client.requestJson<Types.WorkEnableInviteCodeResponseData>(
                "POST",
                "/arts/work/enableInviteCode",
                { auth: "required", body: payload },
            ),
        getFinishList: (params: Types.WorkFinishListParams = {}) =>
            client.requestJson<Types.WorkFinishListResponseData>("GET", "/arts/work/finishList", {
                auth: "required",
                query: params,
            }),
        getDefaultToken: () =>
            client.requestJson<Types.WorkDefaultTokenResponseData>(
                "GET",
                "/arts/work/defaultToken",
                { auth: "required" },
            ),
        getLinkList: (params: Types.WorkLinkListParams) =>
            client.requestJson<Types.WorkLinkListResponseData>("GET", "/arts/work/linkList", {
                auth: "required",
                query: params,
            }),
        communityTask: (payload: Types.WorkCommunityTaskRequest) =>
            client.requestJson<Types.WorkCommunityTaskResponseData>(
                "POST",
                "/arts/work/community",
                { auth: "required", body: payload },
            ),
        getFriendsList: (params: Types.WorkFriendsListParams) =>
            client.requestJson<Types.WorkFriendsListResponseData>("GET", "/arts/work/friendsList", {
                auth: "required",
                query: params,
            }),
    };
}

function createFileModule<E>(client: ArtsApiClient<E>) {
    return {
        upload: (file: Types.UploadFile | FormData, filename?: string) =>
            client.requestJson<Types.FileUploadResponseData>("POST", "/arts/file/upload", {
                auth: "required",
                formData: client.toFormData(file, filename),
            }),
        uploadTicketCover: (file: Types.UploadFile | FormData, filename?: string) =>
            client.requestJson<Types.FileUploadResponseData>("POST", "/arts/file/ticket/cover", {
                auth: "required",
                formData: client.toFormData(file, filename),
            }),
    };
}

function createStaticModule<E>(client: ArtsApiClient<E>) {
    return {
        getTicketCover: (filename: string) =>
            client.requestBinary(
                "GET",
                `/arts/static/ticket/cover/${encodePathSegment(filename)}`,
                { auth: "none" },
            ),
        getUploadFile: (filepath: string) =>
            client.requestBinary("GET", `/arts/static/upload/${encodePath(filepath)}`, {
                auth: "none",
            }),
        getTicketCoverUrl: (filename: string) =>
            buildUrl(
                client.getBaseUrl(),
                `/arts/static/ticket/cover/${encodePathSegment(filename)}`,
            ),
        getUploadUrl: (filepath: string) =>
            buildUrl(client.getBaseUrl(), `/arts/static/upload/${encodePath(filepath)}`),
        getTicketCoverResponse: (filename: string) =>
            client.requestResponse(
                "GET",
                `/arts/static/ticket/cover/${encodePathSegment(filename)}`,
                { auth: "none" },
            ),
        getUploadResponse: (filepath: string) =>
            client.requestResponse("GET", `/arts/static/upload/${encodePath(filepath)}`, {
                auth: "none",
            }),
    };
}

function createNodeModule<E>(client: ArtsApiClient<E>) {
    return {
        getNodeInfo: (params: Types.NodeInfoParams = {}) =>
            client.requestJson<Types.NodeInfoResponseData>("GET", "/arts/node/nodeInfo", {
                auth: "none",
                query: params,
            }),
        getCurrentTierInfo: (params: Types.NodeCurrentTierParams) =>
            client.requestJson<Types.NodeCurrentTierResponseData>(
                "GET",
                `/arts/node/${encodePathSegment(params.id)}/current_tier_info`,
                { auth: "none" },
            ),
        getTxInfo: (params: Types.NodeTxInfoParams) =>
            client.requestJson<Types.NodeTxInfoResponseData>(
                "GET",
                `/arts/node/tx/${encodePathSegment(params.signature)}`,
                { auth: "none" },
            ),
        getQuote: (payload: Types.NodeQuoteRequest) =>
            client.requestJson<Types.NodeQuoteResponseData>("POST", "/arts/node/quote", {
                auth: "required",
                body: payload,
            }),
        purchase: (payload: Types.NodePurchaseRequest) =>
            client.requestJson<Types.NodePurchaseResponseData>("POST", "/arts/node/send", {
                auth: "required",
                body: payload,
            }),
        getTxList: (params: Types.NodeTxListParams = {}) =>
            client.requestJson<Types.NodeTxListResponseData>("GET", "/arts/node/tx", {
                auth: "required",
                query: params,
            }),
        getPayResult: (params: Types.NodePayResultParams) =>
            client.requestJson<Types.NodePayResultResponseData>("GET", "/arts/node/getPayResult", {
                auth: "required",
                query: params,
            }),
        getPurchaseRecords: (params: Types.NodePurchaseRecordsParams = {}) =>
            client.requestJson<Types.NodePurchaseRecordsResponseData>(
                "GET",
                "/arts/node/getPurchaseRecords",
                { auth: "required", query: params },
            ),
        getInviteInfo: () =>
            client.requestJson<Types.NodeInviteInfoResponseData>("GET", "/arts/node/inviteInfo", {
                auth: "required",
            }),
        getInviteRecords: (params: Types.NodeInviteRecordsParams = {}) =>
            client.requestJson<Types.NodeInviteRecordsResponseData>(
                "GET",
                "/arts/node/getInviteRecords",
                { auth: "required", query: params },
            ),
        mining: {
            getRewards: (params: Types.NodeMiningRewardsParams = {}) =>
                client.requestJson<Types.NodeMiningRewardsResponseData>(
                    "GET",
                    "/arts/node/mining/rewards",
                    { auth: "required", query: params },
                ),
            claimRewards: (payload: Types.NodeMiningClaimRequest) =>
                client.requestJson<Types.NodeMiningClaimResponseData>(
                    "POST",
                    "/arts/node/mining/claim",
                    { auth: "required", body: payload },
                ),
            getClaimHistory: (params: Types.NodeMiningClaimHistoryParams = {}) =>
                client.requestJson<Types.NodeMiningClaimHistoryResponseData>(
                    "GET",
                    "/arts/node/mining/claimHistory",
                    { auth: "required", query: params },
                ),
            getHistory: (params: Types.NodeMiningHistoryParams = {}) =>
                client.requestJson<Types.NodeMiningHistoryResponseData>(
                    "GET",
                    "/arts/node/mining/history",
                    { auth: "required", query: params },
                ),
            getBatches: () =>
                client.requestJson<Types.NodeMiningBatchResponseData>(
                    "GET",
                    "/arts/node/mining/batches",
                    { auth: "required" },
                ),
            getSchedulerStatus: () =>
                client.requestJson<Types.NodeMiningSchedulerResponseData>(
                    "GET",
                    "/arts/node/mining/scheduler",
                    { auth: "required" },
                ),
            getCycles: (params: Types.NodeMiningCyclesParams = {}) =>
                client.requestJson<Types.NodeMiningCyclesResponseData>(
                    "GET",
                    "/arts/node/mining/cycles",
                    { auth: "required", query: params },
                ),
            getBatchCycles: (params: Types.NodeMiningBatchCyclesParams) =>
                client.requestJson<Types.NodeMiningBatchCyclesResponseData>(
                    "GET",
                    `/arts/node/mining/batch/${encodePathSegment(params.id)}/cycles`,
                    { auth: "required" },
                ),
        },
    };
}

function createDepositModule<E>(client: ArtsApiClient<E>) {
    return {
        getAddress: () =>
            client.requestJson<Types.DepositAddressResponseData>("GET", "/arts/deposit/address", {
                auth: "none",
            }),
        depositUsdt: (payload: Types.DepositSubmitRequest) =>
            client.requestJson<Types.DepositSubmitResponseData>("POST", "/arts/deposit/usdt", {
                auth: "required",
                body: payload,
            }),
        deposit: (payload: Types.DepositSubmitRequest) =>
            client.requestJson<Types.DepositSubmitResponseData>("POST", "/arts/deposit/deposit", {
                auth: "required",
                body: payload,
            }),
        depositEnt: (payload: Types.DepositSubmitRequest) =>
            client.requestJson<Types.DepositSubmitResponseData>("POST", "/arts/deposit/ent", {
                auth: "required",
                body: payload,
            }),
        withdrawUsdt: (payload: Types.DepositWithdrawRequest) =>
            client.requestJson<Types.ApiMessageData>("POST", "/arts/deposit/withdraw", {
                auth: "required",
                body: payload,
            }),
        getBalance: () =>
            client.requestJson<Types.DepositBalanceResponseData>("GET", "/arts/deposit/balance", {
                auth: "required",
            }),
        getHistory: (params: Types.DepositHistoryParams = {}) =>
            client.requestJson<Types.DepositHistoryResponseData>("GET", "/arts/deposit/history", {
                auth: "required",
                query: params,
            }),
        getStats: () =>
            client.requestJson<Types.DepositStatsResponseData>("GET", "/arts/deposit/stats", {
                auth: "required",
            }),
        getWithdrawHistory: (params: Types.DepositWithdrawHistoryParams = {}) =>
            client.requestJson<Types.DepositWithdrawHistoryResponseData>(
                "GET",
                "/arts/deposit/withdraw/history",
                { auth: "required", query: params },
            ),
        getWithdrawStats: () =>
            client.requestJson<Types.DepositWithdrawStatsResponseData>(
                "GET",
                "/arts/deposit/withdraw/stats",
                { auth: "required" },
            ),
        getWithdrawTx: (params: Types.DepositWithdrawTxParams) =>
            client.requestJson<Types.DepositWithdrawTxResponseData>(
                "GET",
                `/arts/deposit/withdraw/tx/${encodePathSegment(params.tx_hash)}`,
                { auth: "required" },
            ),
    };
}

function createTicketModule<E>(client: ArtsApiClient<E>) {
    return {
        purchase: (payload: Types.TicketPurchaseRequest) =>
            client.requestJson<Types.TicketPurchaseResponseData>("POST", "/arts/ticket/purchase", {
                auth: "required",
                body: payload,
            }),
        getAvailable: (params: Types.TicketAvailableParams = {}) =>
            client.requestJson<Types.TicketAvailableResponseData>("GET", "/arts/ticket/available", {
                auth: "optional",
                query: params,
            }),
        getDetail: (params: Types.TicketDetailParams) =>
            client.requestJson<Types.TicketDetailResponseData>(
                "GET",
                `/arts/ticket/${encodePathSegment(params.ticket_id)}`,
                { auth: "optional" },
            ),
        getPurchaseResult: (params: Types.TicketPurchaseResultParams) =>
            client.requestJson<Types.TicketPurchaseResultResponseData>(
                "GET",
                `/arts/ticket/purchase/result/${encodePathSegment(params.task_id)}`,
                { auth: "required" },
            ),
        getMyPurchases: (params: Types.TicketMyPurchasesParams = {}) =>
            client.requestJson<Types.TicketMyPurchasesResponseData>(
                "GET",
                "/arts/ticket/my/purchases",
                { auth: "required", query: params },
            ),
        getMyTicketRecord: () =>
            client.requestJson<Types.TicketMyRecordResponseData>(
                "GET",
                "/arts/ticket/my/ticket_record",
                { auth: "required" },
            ),
        getMyHoldings: (params: Types.TicketMyHoldingsParams = {}) =>
            client.requestJson<Types.TicketMyHoldingsResponseData>(
                "GET",
                "/arts/ticket/my/holdings",
                { auth: "required", query: params },
            ),
        getMyInstances: (params: Types.TicketMyInstancesParams) =>
            client.requestJson<Types.TicketMyInstancesResponseData>(
                "GET",
                `/arts/ticket/my/instances/${encodePathSegment(params.ticket_item_id)}`,
                { auth: "required" },
            ),
        getInstanceDetail: (params: Types.TicketInstanceDetailParams) =>
            client.requestJson<Types.TicketInstanceDetailResponseData>(
                "GET",
                `/arts/ticket/instance/${encodePathSegment(params.instance_id)}`,
                { auth: "optional" },
            ),
        getKline: (params: Types.TicketKlineParams) =>
            client.requestJson<Types.TicketKlineResponseData>("GET", "/arts/ticket/kline", {
                auth: "none",
                query: params,
            }),
        getStats: (params: Types.TicketStatsParams) =>
            client.requestJson<Types.TicketStatsResponseData>(
                "GET",
                `/arts/ticket/stats/${encodePathSegment(params.ticket_id)}`,
                { auth: "none" },
            ),
        getPriceChange: (params: Types.TicketPriceChangeParams) =>
            client.requestJson<Types.TicketPriceChangeResponseData>(
                "GET",
                `/arts/ticket/price-change/${encodePathSegment(params.ticket_id)}`,
                { auth: "none" },
            ),
        getMarketOverview: () =>
            client.requestJson<Types.TicketMarketOverviewResponseData>(
                "GET",
                "/arts/ticket/market/overview",
                { auth: "none" },
            ),
        registerPresale: (payload: Types.TicketPresaleRegisterRequest) =>
            client.requestJson<Types.TicketPresaleRegisterResponseData>(
                "POST",
                "/arts/ticket/presale/register",
                { auth: "required", body: payload },
            ),
    };
}

function createConsignmentModule<E>(client: ArtsApiClient<E>) {
    return {
        create: (payload: Types.ConsignmentCreateRequest) =>
            client.requestJson<Types.ConsignmentCreateResponseData>(
                "POST",
                "/arts/consignment/create",
                { auth: "required", body: payload },
            ),
        batchCreate: (payload: Types.ConsignmentBatchCreateRequest) =>
            client.requestJson<Types.ConsignmentBatchCreateResponseData>(
                "POST",
                "/arts/consignment/batch/create",
                { auth: "required", body: payload },
            ),
        cancel: (payload: Types.ConsignmentCancelRequest) =>
            client.requestJson<Types.ConsignmentCancelResponseData>(
                "POST",
                "/arts/consignment/cancel",
                { auth: "required", body: payload },
            ),
        getMarket: (params: Types.ConsignmentMarketParams = {}) =>
            client.requestJson<Types.ConsignmentMarketResponseData>(
                "GET",
                "/arts/consignment/market",
                { auth: "optional", query: params },
            ),
        getMarketStats: (params: Types.ConsignmentMarketStatsParams) =>
            client.requestJson<Types.ConsignmentMarketStatsResponseData>(
                "GET",
                `/arts/consignment/market/stats/${encodePathSegment(params.ticket_id)}`,
                { auth: "none" },
            ),
        getPriceHistory: (params: Types.ConsignmentPriceHistoryParams) =>
            client.requestJson<Types.ConsignmentPriceHistoryResponseData>(
                "GET",
                `/arts/consignment/price/history/${encodePathSegment(params.ticket_id)}`,
                { auth: "none", query: { days: params.days } },
            ),
        getAllStats: () =>
            client.requestJson<Types.ConsignmentStatsAllResponseData>(
                "GET",
                "/arts/consignment/stats/all",
                { auth: "none" },
            ),
        getStats: (params: Types.ConsignmentStatsParams) =>
            client.requestJson<Types.ConsignmentStatsResponseData>(
                "GET",
                `/arts/consignment/stats/${encodePathSegment(params.ticket_id)}`,
                { auth: "none" },
            ),
        getMyOrders: (params: Types.ConsignmentMyOrdersParams = {}) =>
            client.requestJson<Types.ConsignmentMyOrdersResponseData>(
                "GET",
                "/arts/consignment/my/orders",
                { auth: "required", query: params },
            ),
    };
}

function createChannelModule<E>(client: ArtsApiClient<E>) {
    return {
        submit: (payload: Types.ChannelSubmitRequest) =>
            client.requestJson<Types.ChannelSubmitResponseData>("POST", "/arts/channel/submit", {
                auth: "required",
                body: payload,
            }),
        getInfo: (params: Types.ChannelInfoParams = {}) =>
            client.requestJson<Types.ChannelInfoResponseData>("GET", "/arts/channel/info", {
                auth: "optional",
                query: params,
            }),
    };
}

function createHealthModule<E>(client: ArtsApiClient<E>) {
    return {
        quick: () =>
            client.requestJson<Types.HealthQuickResponseData>("GET", "/arts/health/cycle/quick", {
                auth: "none",
            }),
        getSummary: () =>
            client.requestJson<Types.HealthSummaryResponseData>(
                "GET",
                "/arts/health/cycle/summary",
                { auth: "none" },
            ),
        getStatus: () =>
            client.requestJson<Types.HealthStatusResponseData>("GET", "/arts/health/cycle/status", {
                auth: "none",
            }),
        getMetrics: () =>
            client.requestJson<Types.HealthMetricsResponseData>(
                "GET",
                "/arts/health/cycle/metrics",
                { auth: "none" },
            ),
        check: () =>
            client.requestJson<Types.HealthCheckResponseData>("POST", "/arts/health/cycle/check", {
                auth: "required",
            }),
        consistency: () =>
            client.requestJson<Types.HealthConsistencyResponseData>(
                "POST",
                "/arts/health/cycle/consistency",
                { auth: "required" },
            ),
        recovery: () =>
            client.requestJson<Types.HealthRecoveryResponseData>(
                "POST",
                "/arts/health/cycle/recovery",
                { auth: "required" },
            ),
        adminOperation: (payload: Types.HealthAdminOperationRequest) =>
            client.requestJson<Types.HealthAdminOperationResponseData>(
                "POST",
                "/arts/health/admin/operation",
                { auth: "required", body: payload },
            ),
    };
}

function createAdminModule<E>(client: ArtsApiClient<E>) {
    return {
        ticket: {
            create: (payload: Types.AdminTicketCreateRequest) =>
                client.requestJson<Types.AdminTicketCreateResponseData>(
                    "POST",
                    "/arts/admin/ticket/create",
                    { auth: "required", body: payload },
                ),
            updateStatus: (
                params: Types.AdminTicketUpdateStatusParams,
                payload: Types.AdminTicketUpdateStatusRequest,
            ) =>
                client.requestJson<Types.AdminTicketUpdateStatusResponseData>(
                    "PUT",
                    `/arts/admin/ticket/${encodePathSegment(params.id)}/status`,
                    { auth: "required", body: payload },
                ),
            list: (params: Types.AdminTicketListParams = {}) =>
                client.requestJson<Types.AdminTicketListResponseData>(
                    "GET",
                    "/arts/admin/ticket/list",
                    { auth: "required", query: params },
                ),
            detail: (params: Types.AdminTicketDetailParams) =>
                client.requestJson<Types.AdminTicketDetailResponseData>(
                    "GET",
                    `/arts/admin/ticket/${encodePathSegment(params.id)}`,
                    { auth: "required" },
                ),
            marketOverview: () =>
                client.requestJson<Types.AdminTicketMarketOverviewResponseData>(
                    "GET",
                    "/arts/admin/ticket/market/overview",
                    { auth: "required" },
                ),
        },
        ticketStats: {
            getHoldingSnapshot: (params: Types.AdminHoldingSnapshotParams = {}) =>
                client.requestJson<Types.AdminHoldingSnapshotResponseData>(
                    "GET",
                    "/arts/admin/ticket/holding_snapshot",
                    { auth: "required", query: params },
                ),
            exportHoldingSnapshot: (params: Types.AdminHoldingSnapshotExportParams = {}) =>
                client.requestBinary("GET", "/arts/admin/ticket/holding_snapshot/export", {
                    auth: "required",
                    query: params,
                }),
            getHoldingRanking: (params: Types.AdminHoldingRankingParams = {}) =>
                client.requestJson<Types.AdminHoldingRankingResponseData>(
                    "GET",
                    "/arts/admin/ticket/holding_ranking",
                    { auth: "required", query: params },
                ),
            getHoldingTrends: (params: Types.AdminHoldingTrendsParams = {}) =>
                client.requestJson<Types.AdminHoldingTrendsResponseData>(
                    "GET",
                    "/arts/admin/ticket/holding_trends",
                    { auth: "required", query: params },
                ),
            getHoldingStats: (params: Types.AdminHoldingStatsParams = {}) =>
                client.requestJson<Types.AdminHoldingStatsResponseData>(
                    "GET",
                    "/arts/admin/ticket/holding_stats",
                    { auth: "required", query: params },
                ),
        },
        tasks: {
            getStatus: () =>
                client.requestJson<Types.AdminTasksStatusResponseData>(
                    "GET",
                    "/arts/admin/tasks/status",
                    { auth: "required" },
                ),
            restart: (payload: Types.AdminTasksRestartRequest) =>
                client.requestJson<Types.AdminTasksRestartResponseData>(
                    "POST",
                    "/arts/admin/tasks/restart",
                    { auth: "required", body: payload },
                ),
            getOverview: () =>
                client.requestJson<Types.AdminTasksOverviewResponseData>(
                    "GET",
                    "/arts/admin/tasks/overview",
                    { auth: "required" },
                ),
            getKlineStatus: () =>
                client.requestJson<Types.AdminKlineStatusResponseData>(
                    "GET",
                    "/arts/admin/tasks/kline/status",
                    { auth: "required" },
                ),
            getPriceStatus: () =>
                client.requestJson<Types.AdminPriceStatusResponseData>(
                    "GET",
                    "/arts/admin/tasks/price/status",
                    { auth: "required" },
                ),
            generateSnapshot: (payload: Types.AdminSnapshotGenerateRequest) =>
                client.requestJson<Types.AdminSnapshotGenerateResponseData>(
                    "POST",
                    "/arts/admin/tasks/snapshot/generate",
                    { auth: "required", body: payload },
                ),
            getSnapshotStats: () =>
                client.requestJson<Types.AdminSnapshotStatsResponseData>(
                    "GET",
                    "/arts/admin/tasks/snapshot/stats",
                    { auth: "required" },
                ),
            restartSnapshot: () =>
                client.requestJson<Types.AdminSnapshotRestartResponseData>(
                    "POST",
                    "/arts/admin/tasks/snapshot/restart",
                    { auth: "required" },
                ),
        },
    };
}
