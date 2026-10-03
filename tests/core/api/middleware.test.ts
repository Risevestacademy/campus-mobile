import { authMiddleware } from "@core/api/middleware";
import { authEvents } from "@core/auth/authEvents";
import {
  clearAuthTokens,
  getAuthTokens,
  saveAuthTokens,
} from "@core/auth/tokenStorage";

type OnRequestParams = Parameters<
  NonNullable<typeof authMiddleware.onRequest>
>[0];
type OnResponseParams = Parameters<
  NonNullable<typeof authMiddleware.onResponse>
>[0];

describe("authMiddleware", () => {
  const originalFetch = global.fetch;

  beforeEach(async () => {
    await clearAuthTokens();
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("onRequest", () => {
    it("adds Bearer authorization header to protected requests when token exists", async () => {
      await saveAuthTokens({ accessToken: "test-access-token" });

      const req = new Request("http://localhost:3000/v1/auth/me", {
        method: "GET",
        headers: new Headers(),
      });

      await authMiddleware.onRequest!({
        request: req,
        options: {} as OnRequestParams["options"],
        schemaPath: "/v1/auth/me",
        params: {} as OnRequestParams["params"],
        id: "1",
      } as OnRequestParams);

      expect(req.headers.get("Authorization")).toBe("Bearer test-access-token");
    });

    it("does not add authorization header to public requests", async () => {
      await saveAuthTokens({ accessToken: "test-access-token" });

      const req = new Request("http://localhost:3000/v1/auth/google/token", {
        method: "POST",
        headers: new Headers(),
      });

      await authMiddleware.onRequest!({
        request: req,
        options: {} as OnRequestParams["options"],
        schemaPath: "/v1/auth/google/token",
        params: {} as OnRequestParams["params"],
        id: "1",
      } as OnRequestParams);

      expect(req.headers.get("Authorization")).toBeNull();
    });

    it("does nothing if no access token is stored", async () => {
      const req = new Request("http://localhost:3000/v1/auth/me", {
        method: "GET",
        headers: new Headers(),
      });

      await authMiddleware.onRequest!({
        request: req,
        options: {} as OnRequestParams["options"],
        schemaPath: "/v1/auth/me",
        params: {} as OnRequestParams["params"],
        id: "1",
      } as OnRequestParams);

      expect(req.headers.get("Authorization")).toBeNull();
    });
  });

  describe("onResponse", () => {
    it("ignores non-401 responses", async () => {
      const req = new Request("http://localhost:3000/v1/auth/me");
      const res = new Response(JSON.stringify({ ok: true }), { status: 200 });

      const result = await authMiddleware.onResponse!({
        request: req,
        response: res,
        options: {} as OnResponseParams["options"],
        schemaPath: "/v1/auth/me",
        params: {} as OnResponseParams["params"],
        id: "1",
      } as OnResponseParams);

      expect(result).toBeUndefined();
    });

    it("ignores 401 responses on public paths", async () => {
      const req = new Request("http://localhost:3000/v1/auth/refresh");
      const res = new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });

      const result = await authMiddleware.onResponse!({
        request: req,
        response: res,
        options: {} as OnResponseParams["options"],
        schemaPath: "/v1/auth/refresh",
        params: {} as OnResponseParams["params"],
        id: "1",
      } as OnResponseParams);

      expect(result).toBeUndefined();
    });

    it("attempts refresh on 401, saves new tokens, emits event, and retries request", async () => {
      await saveAuthTokens({
        accessToken: "old-access-token",
        refreshToken: "valid-refresh-token",
      });

      const emitRefreshedSpy = jest.spyOn(authEvents, "emitSessionRefreshed");

      const req = new Request("http://localhost:3000/v1/users/profile", {
        method: "GET",
        headers: new Headers({
          Authorization: "Bearer old-access-token",
        }),
      });

      // Prepare request clone map by calling onRequest
      await authMiddleware.onRequest!({
        request: req,
        options: {} as OnRequestParams["options"],
        schemaPath: "/v1/users/profile",
        params: {} as OnRequestParams["params"],
        id: "1",
      } as OnRequestParams);

      // Mock global.fetch for refresh call AND for retry call
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              accessToken: "new-access-token",
              refreshToken: "new-refresh-token",
              expiresAt: "2026-10-03T00:00:00Z",
              refreshExpiresAt: "2026-10-10T00:00:00Z",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          ),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ user: "retried-user" }), {
            status: 200,
          }),
        );

      const res401 = new Response(null, { status: 401 });

      const retryResponse = await authMiddleware.onResponse!({
        request: req,
        response: res401,
        options: {} as OnResponseParams["options"],
        schemaPath: "/v1/users/profile",
        params: {} as OnResponseParams["params"],
        id: "1",
      } as OnResponseParams);

      expect(global.fetch).toHaveBeenCalledTimes(2);

      // First fetch call is to refresh endpoint
      const refreshCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(refreshCall[0]).toContain("/v1/auth/refresh");
      expect(refreshCall[1].body).toBe(
        JSON.stringify({ refreshToken: "valid-refresh-token" }),
      );

      // Tokens updated in store
      const tokens = await getAuthTokens();
      expect(tokens?.accessToken).toBe("new-access-token");
      expect(tokens?.refreshToken).toBe("new-refresh-token");

      expect(emitRefreshedSpy).toHaveBeenCalled();
      expect(retryResponse).toBeDefined();
    });

    it("signs out and emits unauthenticated when refresh endpoint returns 401/403", async () => {
      await saveAuthTokens({
        accessToken: "old-access-token",
        refreshToken: "expired-refresh-token",
      });

      const emitUnauthSpy = jest.spyOn(authEvents, "emitUnauthenticated");

      const req = new Request("http://localhost:3000/v1/users/profile", {
        method: "GET",
      });

      await authMiddleware.onRequest!({
        request: req,
        options: {} as OnRequestParams["options"],
        schemaPath: "/v1/users/profile",
        params: {} as OnRequestParams["params"],
        id: "1",
      } as OnRequestParams);

      // Refresh returns 401
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(null, { status: 401 }),
      );

      const res401 = new Response(null, { status: 401 });

      const result = await authMiddleware.onResponse!({
        request: req,
        response: res401,
        options: {} as OnResponseParams["options"],
        schemaPath: "/v1/users/profile",
        params: {} as OnResponseParams["params"],
        id: "1",
      } as OnResponseParams);

      expect(result).toBeUndefined();
      expect(await getAuthTokens()).toBeNull();
      expect(emitUnauthSpy).toHaveBeenCalled();
    });

    it("handles network error during refresh without signing user out", async () => {
      await saveAuthTokens({
        accessToken: "old-access-token",
        refreshToken: "valid-refresh-token",
      });

      const emitUnauthSpy = jest.spyOn(authEvents, "emitUnauthenticated");
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const req = new Request("http://localhost:3000/v1/users/profile", {
        method: "GET",
      });

      await authMiddleware.onRequest!({
        request: req,
        options: {} as OnRequestParams["options"],
        schemaPath: "/v1/users/profile",
        params: {} as OnRequestParams["params"],
        id: "1",
      } as OnRequestParams);

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network Error"),
      );

      const res401 = new Response(null, { status: 401 });

      const result = await authMiddleware.onResponse!({
        request: req,
        response: res401,
        options: {} as OnResponseParams["options"],
        schemaPath: "/v1/users/profile",
        params: {} as OnResponseParams["params"],
        id: "1",
      } as OnResponseParams);

      expect(result).toBeUndefined();
      // Tokens remain in store because it was a network error
      expect(await getAuthTokens()).not.toBeNull();
      expect(emitUnauthSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
