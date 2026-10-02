import {
  useInviteDecision,
  useInvitePreview,
  useInviteValidate,
  useLogout,
  useSignInWithGoogle,
} from "@features/auth/hooks";
import { AuthService } from "@services/auth";
import { InviteService } from "@services/invite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

jest.mock("@services/auth", () => ({
  AuthService: {
    signInWithGoogle: jest.fn(),
    logout: jest.fn(),
  },
}));

jest.mock("@services/invite", () => ({
  InviteService: {
    previewInvite: jest.fn(),
    decideOnInvite: jest.fn(),
    validateInvite: jest.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false, gcTime: 0 },
    },
  });
  function QueryClientWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return QueryClientWrapper;
};

describe("Auth Hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useSignInWithGoogle", () => {
    it("calls AuthService.signInWithGoogle", async () => {
      const mockResult = {
        scope: "full_access" as const,
        accessToken: "access-token-1",
        expiresAt: "2026-10-03T00:00:00Z",
        refreshToken: null,
        refreshExpiresAt: null,
        inviteId: null,
      };
      (AuthService.signInWithGoogle as jest.Mock).mockResolvedValueOnce(
        mockResult,
      );

      const { result } = await renderHook(() => useSignInWithGoogle(), {
        wrapper: createWrapper(),
      });

      let res:
        Awaited<ReturnType<typeof AuthService.signInWithGoogle>> | undefined;
      await act(async () => {
        res = await result.current.signInWithGoogle("id-token-123");
      });

      expect(AuthService.signInWithGoogle).toHaveBeenCalledWith(
        "id-token-123",
        expect.anything(),
      );
      expect(res).toEqual(mockResult);
    });
  });

  describe("useLogout", () => {
    it("calls AuthService.logout", async () => {
      (AuthService.logout as jest.Mock).mockResolvedValueOnce(undefined);

      const { result } = await renderHook(() => useLogout(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(AuthService.logout).toHaveBeenCalledWith(
        undefined,
        expect.anything(),
      );
    });
  });

  describe("useInvitePreview", () => {
    it("calls InviteService.previewInvite", async () => {
      const mockPreview = { email: "test@example.com" };
      (InviteService.previewInvite as jest.Mock).mockResolvedValueOnce(
        mockPreview,
      );

      const { result } = await renderHook(() => useInvitePreview(), {
        wrapper: createWrapper(),
      });

      let res: unknown;
      await act(async () => {
        res = await result.current.previewInvite("token-abc");
      });

      expect(InviteService.previewInvite).toHaveBeenCalledWith(
        "token-abc",
        expect.anything(),
      );
      expect(res).toEqual(mockPreview);
    });
  });

  describe("useInviteDecision", () => {
    it("calls InviteService.decideOnInvite", async () => {
      const mockDecision = {
        inviteId: "token-abc",
        status: "accepted" as const,
        decidedAt: "2026-10-02T00:00:00Z",
      };
      (InviteService.decideOnInvite as jest.Mock).mockResolvedValueOnce(
        mockDecision,
      );

      const { result } = await renderHook(() => useInviteDecision(), {
        wrapper: createWrapper(),
      });

      let res: unknown;
      await act(async () => {
        res = await result.current.decideOnInvite({
          token: "token-abc",
          decision: "accept",
        });
      });

      expect(InviteService.decideOnInvite).toHaveBeenCalledWith(
        expect.objectContaining({
          token: "token-abc",
          decision: "accept",
        }),
        expect.anything(),
      );
      expect(res).toEqual(mockDecision);
    });
  });

  describe("useInviteValidate", () => {
    it("fetches validateInvite query when enabled", async () => {
      const mockValidateData = { user: { displayName: "Jane" } };
      (InviteService.validateInvite as jest.Mock).mockResolvedValueOnce(
        mockValidateData,
      );

      const { result } = await renderHook(
        () => useInviteValidate({ enabled: true }),
        {
          wrapper: createWrapper(),
        },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(InviteService.validateInvite).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual(mockValidateData);
    });
  });
});
