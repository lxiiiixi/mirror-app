import { ArtsApiClient, defaultArtsApiErrorFormatter } from "@mirror/api";
import { envConfigs } from "@mirror/utils";
import i18n from "../i18n";
import { handleUnauthorized } from "../utils/authSession";

export const artsApiClient = new ArtsApiClient({
    baseUrl: envConfigs.ARTS_API_BASE,
    languageResolver: () => i18n.resolvedLanguage ?? i18n.language ?? "en",
    errorFormatter: (input) => {
        const error = defaultArtsApiErrorFormatter(input);
        if (input.status === 401 || input.code === 401) {
            handleUnauthorized();
        }
        return error;
    },
});
