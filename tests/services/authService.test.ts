import { client } from "@core/api";
import {
  clearAuthTokens,
  getAuthTokens,
  saveAuthTokens,
} from "@core/auth/tokenStorage";
import { AuthService } from "@services/auth";

describe("AuthService", () => {
  beforeEach(async () => {
    await clearAuthTokens();
    jest.clearAllMocks();
  });

  describe("signInWithGoogle", () => {
    it("calls API endpoint and saves tokens on success", async () => {
      const mockResponseData = {
        accessToken: "google-access-token",
        refreshToken: "google-refresh-token",
        expiresAt: "2026-10-03T00:00:00Z",
        refreshExpiresAt: "2026-10-10T00:00:00Z",
        user: { id: "u1", email: "test@example.com" },
      };

      jest.spyOn(client, "POST").mockResolvedValueOnce({
        data: mockResponseData,
        response: new Response(),
      } as unknown as ReturnType<typeof client.POST>);

      const result = await AuthService.signInWithGoogle("mock-id-token");

      expect(client.POST).toHaveBeenCalledWith("/v1/auth/google/token", {
        body: { idToken: "mock-id-token" },
      });
      expect(result).toEqual(mockResponseData);

      const storedTokens = await getAuthTokens();
      expect(storedTokens?.accessToken).toBe("google-access-token");
      expect(storedTokens?.refreshToken).toBe("google-refresh-token");
    });
  });

  describe("getMe", () => {
    it("fetches signed in user profile from API", async () => {
      const mockUserData = { id: "u1", email: "student@campus.com" };

      jest.spyOn(client, "GET").mockResolvedValueOnce({
        data: mockUserData,
        response: new Response(),
      } as unknown as ReturnType<typeof client.GET>);

      const user = await AuthService.getMe();

      expect(client.GET).toHaveBeenCalledWith("/v1/auth/me");
      expect(user).toEqual(mockUserData);
    });
  });

  describe("logout", () => {
    it("posts refreshToken to logout endpoint and clears auth tokens", async () => {
      await saveAuthTokens({
        accessToken: "acc-token",
        refreshToken: "ref-token",
      });

      jest.spyOn(client, "POST").mockResolvedValueOnce({
        data: { success: true },
        response: new Response(),
      } as unknown as ReturnType<typeof client.POST>);

      await AuthService.logout();

      expect(client.POST).toHaveBeenCalledWith("/v1/auth/logout", {
        body: { refreshToken: "ref-token" },
      });
      expect(await getAuthTokens()).toBeNull();
    });

    it("clears tokens even if no refreshToken is present", async () => {
      await saveAuthTokens({ accessToken: "acc-token" });

      const postSpy = jest.spyOn(client, "POST");

      await AuthService.logout();

      expect(postSpy).not.toHaveBeenCalled();
      expect(await getAuthTokens()).toBeNull();
    });
  });
});
