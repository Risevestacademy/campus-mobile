import createFetchClient from "openapi-fetch";

import config from "../config";
import type { paths } from "./generated/schema";
import { authMiddleware, loggingMiddleware } from "./middleware";

const client = createFetchClient<paths>({
  baseUrl: config.apiBaseUrl,
});

client.use(authMiddleware);
client.use(loggingMiddleware);

export { client };
