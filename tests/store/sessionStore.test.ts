import { clearAuthTokens } from "@core/auth/tokenStorage";
import { queryClient } from "@shared/lib/react-query";
import { useSessionStore } from "@store/session";

jest.mock("@core/auth/tokenStorage", () => ({
  getAuthTokens: jest.fn(),
  clearAuthTokens: jest.fn().mockResolvedValue(undefined),
}));

describe("useSessionStore - clearSession", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSessionStore.setState({ status: "authenticated", hasInvite: false });
  });

  it("cancels in-flight queries, clears cache, clears tokens, and sets status to unauthenticated in order", async () => {
    const executionOrder: string[] = [];

    jest.spyOn(queryClient, "cancelQueries").mockImplementation(async () => {
      executionOrder.push("cancelQueries");
    });
    jest.spyOn(queryClient, "clear").mockImplementation(() => {
      executionOrder.push("clearCache");
    });
    (clearAuthTokens as jest.Mock).mockImplementation(async () => {
      executionOrder.push("clearAuthTokens");
    });

    await useSessionStore.getState().clearSession("expired");

    expect(executionOrder).toEqual([
      "cancelQueries",
      "clearCache",
      "clearAuthTokens",
    ]);
    expect(useSessionStore.getState().status).toBe("unauthenticated");
  });

  it("handles clearSession with different reasons", async () => {
    await useSessionStore.getState().clearSession("logout");
    expect(useSessionStore.getState().status).toBe("unauthenticated");
  });
});

describe("useSessionStore - hydrate", () => {
  const tokenStorage = jest.requireMock("@core/auth/tokenStorage");

  beforeEach(() => {
    jest.clearAllMocks();
    useSessionStore.setState({ status: "loading", hasInvite: false });
  });

  it("sets status to authenticated when valid access and refresh tokens exist and refresh token is not expired", async () => {
    const futureDate = new Date(Date.now() + 3600 * 1000).toISOString();
    tokenStorage.getAuthTokens.mockResolvedValue({
      accessToken: "valid-access",
      refreshToken: "valid-refresh",
      refreshExpiresAt: futureDate,
    });
    tokenStorage.isRefreshTokenExpired.mockResolvedValue(false);

    await useSessionStore.getState().hydrate();

    expect(useSessionStore.getState().status).toBe("authenticated");
  });

  it("triggers clearSession and sets unauthenticated when tokens are missing", async () => {
    tokenStorage.getAuthTokens.mockResolvedValue(null);

    await useSessionStore.getState().hydrate();

    expect(useSessionStore.getState().status).toBe("unauthenticated");
  });

  it("triggers clearSession and sets unauthenticated when refresh token is expired", async () => {
    const pastDate = new Date(Date.now() - 1000).toISOString();
    tokenStorage.getAuthTokens.mockResolvedValue({
      accessToken: "valid-access",
      refreshToken: "expired-refresh",
      refreshExpiresAt: pastDate,
    });
    tokenStorage.isRefreshTokenExpired.mockResolvedValue(true);

    await useSessionStore.getState().hydrate();

    expect(useSessionStore.getState().status).toBe("unauthenticated");
  });
});
