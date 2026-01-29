import { ArtsApiClient } from "@mirror/api";
import { envConfigs } from "@mirror/utils";

export const artsApiClient = new ArtsApiClient({
    baseUrl: envConfigs.ARTS_API_BASE,
});
