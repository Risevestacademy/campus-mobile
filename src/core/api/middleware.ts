import { authEvents } from "@core/auth/authEvents";
import {
  clearAuthTokens,
  getAuthTokens,
  isRefreshTokenExpired,
  saveAuthTokens,
} from "@core/auth/tokenStorage";
import config from "@core/config";
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

async function signOut(): Promise<null> {
  await clearAuthTokens();
  authEvents.emitUnauthenticated();
  return null;
}

async function performTokenRefresh(): Promise<string | null> {
  const tokens = await getAuthTokens();
  if (!tokens?.refreshToken) return signOut();

  if (await isRefreshTokenExpired()) return signOut();

  try {
    const response = await fetch(`${config.apiBaseUrl}/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });

    // The server rejected the refresh token: the session is really over
    if (response.status === 401 || response.status === 403) {
      return signOut();
    }

    // Transient server problem (5xx, 429, ...): keep tokens, fail this request
    if (!response.ok) return null;

    const data = (await response.json()) as RefreshResponseDto;
    if (!data.accessToken) return signOut();

    await saveAuthTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? tokens.refreshToken,
      accessExpiresAt: data.expiresAt,
      refreshExpiresAt: data.refreshExpiresAt,
    });

    authEvents.emitSessionRefreshed();
    return data.accessToken;
  } catch (error) {
    // Network error: don't sign the user out because they went offline
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
    if (isPublicPath(request.url)) return;

    // Keep an unused copy of the request so its body can be replayed on retry
    retryCopies.set(request, request.clone());

    const tokens = await getAuthTokens();
    if (tokens?.accessToken) {
      request.headers.set("Authorization", `Bearer ${tokens.accessToken}`);
    }
    // no return: leaves the request unchanged
  },

  async onResponse({ request, response }) {
    if (response.status !== 401) return;
    if (isPublicPath(request.url)) return;

    const original = retryCopies.get(request);
    retryCopies.delete(request);
    if (!original) return;

    // If another request already refreshed while this one was in flight,
    // reuse the new token instead of refreshing a second time
    const sent = request.headers.get("Authorization");
    const current = (await getAuthTokens())?.accessToken;
    const newAccessToken =
      current && sent !== `Bearer ${current}` ? current : await refreshOnce();

    // Refresh failed: let the original 401 reach the caller
    if (!newAccessToken) return;

    const retry = new Request(original, {
      headers: new Headers(original.headers),
    });
    retry.headers.set("Authorization", `Bearer ${newAccessToken}`);

    // Returning a Response is the only intended replacement
    return fetch(retry);
  },
};

export const loggingMiddleware: Middleware = {
  async onRequest() {},
  async onResponse() {},
};
