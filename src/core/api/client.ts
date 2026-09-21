import createFetchClient from "openapi-fetch";

import config from "../config";
import type { paths } from "./generated/schema";
import { loggingMiddleware } from "./middleware";

const client = createFetchClient<paths>({
  baseUrl: config.apiBaseUrl,
});

client.use(loggingMiddleware);

export { client };
