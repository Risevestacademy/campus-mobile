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

    await useSessionStore.getState().clearSession();

    expect(executionOrder).toEqual([
      "cancelQueries",
      "clearCache",
      "clearAuthTokens",
    ]);
    expect(useSessionStore.getState().status).toBe("unauthenticated");
  });
});
