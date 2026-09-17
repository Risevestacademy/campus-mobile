import { env } from "@core/config";
import createFetchClient from "openapi-fetch";

import { loggingMiddleware } from "./middleware";
import type { paths } from "./schema";

const $api = createFetchClient<paths>({
  baseUrl: env.apiBaseUrl,
});

$api.use(loggingMiddleware);

export default $api;
