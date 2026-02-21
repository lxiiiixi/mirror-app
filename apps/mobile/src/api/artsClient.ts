import { ArtsApiClient } from "@mirror/api";
import i18n from "../i18n";

const resolveBaseUrl = (): string => {
  const fromExpo = process.env.EXPO_PUBLIC_ARTS_API_BASE;
  return (fromExpo ?? "").trim().replace(/\/$/, "");
};

export const artsApiClient = new ArtsApiClient({
  baseUrl: resolveBaseUrl(),
  languageResolver: () => i18n.resolvedLanguage ?? i18n.language ?? "en",
});
