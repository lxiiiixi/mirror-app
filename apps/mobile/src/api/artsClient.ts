import { ArtsApiClient } from "@mirror/api";
import { envConfigs } from "@mirror/utils";
import i18n from "../i18n";

export const artsApiClient = new ArtsApiClient({
  baseUrl: envConfigs.ARTS_API_BASE,
  languageResolver: () => i18n.resolvedLanguage ?? i18n.language ?? "en",
});
