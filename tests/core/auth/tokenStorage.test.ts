import {
  clearAuthTokens,
  getAuthTokens,
  isAccessTokenExpired,
  isRefreshTokenExpired,
  saveAuthTokens,
} from "@core/auth/tokenStorage";
import * as SecureStore from "expo-secure-store";

describe("tokenStorage", () => {
  beforeEach(async () => {
    // Reset stored tokens in mock
    await clearAuthTokens();
    jest.clearAllMocks();
  });

  describe("saveAuthTokens", () => {
    it("saves accessToken to SecureStore", async () => {
      await saveAuthTokens({ accessToken: "access-123" });

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "campus_access_token",
        "access-123",
      );
    });

    it("saves refreshToken when provided, deletes when null", async () => {
      await saveAuthTokens({
        accessToken: "access-123",
        refreshToken: "refresh-456",
      });
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "campus_refresh_token",
        "refresh-456",
      );

      await saveAuthTokens({
        accessToken: "access-123",
        refreshToken: null,
      });
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "campus_refresh_token",
      );
    });

    it("saves accessExpiresAt and refreshExpiresAt when provided, deletes when null", async () => {
      await saveAuthTokens({
        accessToken: "access-123",
        accessExpiresAt: "2026-10-02T18:00:00Z",
        refreshExpiresAt: "2026-10-09T18:00:00Z",
      });

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "campus_access_expires_at",
        "2026-10-02T18:00:00Z",
      );
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "campus_refresh_expires_at",
        "2026-10-09T18:00:00Z",
      );

      await saveAuthTokens({
        accessToken: "access-123",
        accessExpiresAt: null,
        refreshExpiresAt: null,
      });

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "campus_access_expires_at",
      );
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "campus_refresh_expires_at",
      );
    });
  });

  describe("getAuthTokens", () => {
    it("returns null if no access token exists", async () => {
      const tokens = await getAuthTokens();
      expect(tokens).toBeNull();
    });

    it("returns token object when access token exists", async () => {
      await saveAuthTokens({
        accessToken: "access-123",
        refreshToken: "refresh-456",
        accessExpiresAt: "2026-10-02T18:00:00Z",
      });

      const tokens = await getAuthTokens();
      expect(tokens).toEqual({
        accessToken: "access-123",
        refreshToken: "refresh-456",
        accessExpiresAt: "2026-10-02T18:00:00Z",
        refreshExpiresAt: null,
      });
    });
  });

  describe("clearAuthTokens", () => {
    it("clears all token keys from SecureStore", async () => {
      await saveAuthTokens({
        accessToken: "access-123",
        refreshToken: "refresh-456",
        accessExpiresAt: "2026-10-02T18:00:00Z",
        refreshExpiresAt: "2026-10-09T18:00:00Z",
      });

      await clearAuthTokens();

      const tokens = await getAuthTokens();
      expect(tokens).toBeNull();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "campus_access_token",
      );
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "campus_refresh_token",
      );
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "campus_access_expires_at",
      );
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "campus_refresh_expires_at",
      );
    });
  });

  describe("isAccessTokenExpired", () => {
    it("returns false if no accessExpiresAt key exists", async () => {
      const expired = await isAccessTokenExpired();
      expect(expired).toBe(false);
    });

    it("returns true if token is expiring within bufferSeconds", async () => {
      const futureDate = new Date(Date.now() + 15 * 1000).toISOString(); // 15 seconds in future
      await saveAuthTokens({
        accessToken: "access-123",
        accessExpiresAt: futureDate,
      });

      // Default buffer is 30s, so 15s in future is considered expired
      const expired = await isAccessTokenExpired(30);
      expect(expired).toBe(true);
    });

    it("returns false if token expiration is far in the future", async () => {
      const futureDate = new Date(Date.now() + 3600 * 1000).toISOString(); // 1 hour in future
      await saveAuthTokens({
        accessToken: "access-123",
        accessExpiresAt: futureDate,
      });

      const expired = await isAccessTokenExpired(30);
      expect(expired).toBe(false);
    });
  });

  describe("isRefreshTokenExpired", () => {
    it("returns true if no refreshExpiresAt key exists (treated as invalid/expired)", async () => {
      const expired = await isRefreshTokenExpired();
      expect(expired).toBe(true);
    });

    it("returns true if refreshExpiresAt is malformed or unparsable", async () => {
      await saveAuthTokens({
        accessToken: "access-123",
        refreshExpiresAt: "invalid-date",
      });

      const expired = await isRefreshTokenExpired();
      expect(expired).toBe(true);
    });

    it("returns true if refresh token has past expiry date", async () => {
      const pastDate = new Date(Date.now() - 1000).toISOString();
      await saveAuthTokens({
        accessToken: "access-123",
        refreshExpiresAt: pastDate,
      });

      const expired = await isRefreshTokenExpired();
      expect(expired).toBe(true);
    });

    it("returns false if refresh token has future expiry date", async () => {
      const futureDate = new Date(Date.now() + 3600 * 1000).toISOString();
      await saveAuthTokens({
        accessToken: "access-123",
        refreshExpiresAt: futureDate,
      });

      const expired = await isRefreshTokenExpired();
      expect(expired).toBe(false);
    });
  });
});
