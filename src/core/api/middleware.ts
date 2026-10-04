import {
  clearAuthTokens,
  getAuthTokens,
  isAccessTokenExpired,
  isRefreshTokenExpired,
  saveAuthTokens,
} from "@core/auth/tokenStorage";
import config from "@core/config";
import { useSessionStore } from "@store/session";
import type { Middleware } from "openapi-fetch";

import type { components } from "./generated/schema";

type RefreshResponseDto = components["schemas"]["RefreshResponseDto"];

const PUBLIC_PATHS = new Set([
  "/v1/auth/google",
  "/v1/auth/google/callback",
  "/v1/auth/google/token",
  "/v1/auth/refresh",
  "/v1/health",
]);

let refreshPromise: Promise<string | null> | null = null;

const retryCopies = new WeakMap<Request, Request>();

function isPublicPath(urlStr: string): boolean {
  try {
    const { pathname } = new URL(urlStr);

    const normalized =
      pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

    return PUBLIC_PATHS.has(normalized);
  } catch {
    return false;
  }
}

async function expireSession(): Promise<null> {
  await clearAuthTokens();

  useSessionStore.setState({
    status: "unauthenticated",
  });

  return null;
}

async function performTokenRefresh(): Promise<string | null> {
  const tokens = await getAuthTokens();

  if (!tokens?.refreshToken) {
    return expireSession();
  }

  if (await isRefreshTokenExpired()) {
    return expireSession();
  }

  try {
    const response = await fetch(`${config.apiBaseUrl}/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken: tokens.refreshToken,
      }),
    });

    /*
     * These responses mean the refresh token/session
     * is no longer valid.
     */
    if (
      response.status === 400 ||
      response.status === 401 ||
      response.status === 403
    ) {
      return expireSession();
    }

    /*
     * Don't log the user out because of a temporary
     * server problem.
     */
    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as RefreshResponseDto;

    if (!data.accessToken) {
      return expireSession();
    }

    await saveAuthTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? tokens.refreshToken,
      accessExpiresAt: data.expiresAt,
      refreshExpiresAt: data.refreshExpiresAt,
    });

    return data.accessToken;
  } catch (error) {
    /*
     * Network errors should not destroy the session.
     */
    console.error("Failed to refresh session:", error);

    return null;
  }
}

function refreshOnce(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = performTokenRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export const authMiddleware: Middleware = {
  async onRequest({ request }) {
    if (isPublicPath(request.url)) {
      return;
    }

    /*
     * Save a copy so the request body can be replayed
     * if we need to retry after refreshing the token.
     */
    retryCopies.set(request, request.clone());

    let tokens = await getAuthTokens();

    /*
     * No session. Don't attach an Authorization header.
     */
    if (!tokens?.accessToken) {
      return;
    }

    /*
     * Access token has expired.
     */
    if (await isAccessTokenExpired()) {
      const newAccessToken = await refreshOnce();

      if (!newAccessToken) {
        return;
      }

      tokens = await getAuthTokens();
    }

    if (tokens?.accessToken) {
      request.headers.set("Authorization", `Bearer ${tokens.accessToken}`);
    }
  },

  async onResponse({ request, response }) {
    if (response.status !== 401) {
      return;
    }

    if (isPublicPath(request.url)) {
      return;
    }

    const original = retryCopies.get(request);

    retryCopies.delete(request);

    if (!original) {
      return;
    }

    /*
     * Check whether another request already refreshed
     * the token while this request was in flight.
     */
    const sentAuthorization = request.headers.get("Authorization");

    const currentAccessToken = (await getAuthTokens())?.accessToken;

    const newAccessToken =
      currentAccessToken && sentAuthorization !== `Bearer ${currentAccessToken}`
        ? currentAccessToken
        : await refreshOnce();

    /*
     * Refresh failed.
     *
     * expireSession() has already updated Zustand.
     */
    if (!newAccessToken) {
      return;
    }

    const retry = new Request(original, {
      headers: new Headers(original.headers),
    });

    retry.headers.set("Authorization", `Bearer ${newAccessToken}`);

    return fetch(retry);
  },
};

export const loggingMiddleware: Middleware = {
  async onRequest() {},
  async onResponse() {},
};
