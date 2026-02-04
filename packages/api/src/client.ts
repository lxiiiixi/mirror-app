import type * as Types from "./types";
import {
    isApiResponse,
    normalizeBaseUrl,
    buildUrl,
    isReactNativeFile,
    normalizeLanguage,
    encodePathSegment,
    encodePath,
} from "./utils";
import * as modules from "./module";

type ArtsApiLanguage = Types.ArtsApiLanguage;

export interface ArtsApiError {
    type: Types.ArtsApiErrorType;
    code: number;
    message: string;
    status?: number;
    data?: unknown;
    url: string;
    method: string;
}

export interface ArtsApiErrorInput {
    type: Types.ArtsApiErrorType;
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
    baseUrl?: string;
    token?: string;
    language?: Types.ArtsApiLanguage;
    languageResolver?: () => Types.ArtsApiLanguage | undefined;
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
    private languageResolver?: () => ArtsApiLanguage | undefined;
    private timeoutMs?: number;
    private errorFormatter: ArtsApiErrorFormatter<E>;

    public readonly user: ReturnType<typeof modules.default.createUserModule<E>>;
    public readonly work: ReturnType<typeof modules.default.createWorkModule<E>>;
    public readonly points: ReturnType<typeof modules.default.createPointsModule<E>>;
    public readonly file: ReturnType<typeof modules.default.createFileModule<E>>;
    public readonly static: ReturnType<typeof modules.default.createStaticModule<E>>;
    public readonly node: ReturnType<typeof modules.default.createNodeModule<E>>;
    public readonly deposit: ReturnType<typeof modules.default.createDepositModule<E>>;
    public readonly ticket: ReturnType<typeof modules.default.createTicketModule<E>>;
    public readonly consignment: ReturnType<typeof modules.default.createConsignmentModule<E>>;
    public readonly channel: ReturnType<typeof modules.default.createChannelModule<E>>;
    public readonly health: ReturnType<typeof modules.default.createHealthModule<E>>;
    public readonly admin: ReturnType<typeof modules.default.createAdminModule<E>>;

    constructor(options: ArtsApiClientOptions<E>) {
        this.baseUrl = normalizeBaseUrl(options.baseUrl);
        this.token = options.token;
        this.language = options.language;
        this.languageResolver = options.languageResolver;
        this.timeoutMs = options.timeoutMs;
        this.errorFormatter = (options.errorFormatter ??
            defaultArtsApiErrorFormatter) as ArtsApiErrorFormatter<E>;

        this.user = modules.default.createUserModule(this);
        this.work = modules.default.createWorkModule(this);
        this.points = modules.default.createPointsModule(this);
        this.file = modules.default.createFileModule(this);
        this.static = modules.default.createStaticModule(this);
        this.node = modules.default.createNodeModule(this);
        this.deposit = modules.default.createDepositModule(this);
        this.ticket = modules.default.createTicketModule(this);
        this.consignment = modules.default.createConsignmentModule(this);
        this.channel = modules.default.createChannelModule(this);
        this.health = modules.default.createHealthModule(this);
        this.admin = modules.default.createAdminModule(this);
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

    setLanguageResolver(resolver?: () => ArtsApiLanguage | undefined) {
        this.languageResolver = resolver;
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

        const language = this.resolveLanguage(options.language);
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

    private resolveLanguage(explicit?: ArtsApiLanguage) {
        if (explicit) {
            return normalizeLanguage(explicit);
        }
        if (this.languageResolver) {
            return normalizeLanguage(this.languageResolver());
        }
        return normalizeLanguage(this.language);
    }
}
