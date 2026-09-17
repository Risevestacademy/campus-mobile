import { Middleware } from "openapi-fetch";

export const loggingMiddleware: Middleware = {
  async onRequest({ request }) {
    return request;
  },
  async onResponse({ response }) {
    return response;
  },
};
