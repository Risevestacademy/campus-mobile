import {
  clearAuthTokens,
  getAuthTokens,
  isRefreshTokenExpired,
} from "@core/auth/tokenStorage";
import { queryClient } from "@shared/lib/react-query";
import { create } from "zustand";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

type SessionStore = {
  status: SessionStatus;
  hasInvite: boolean;

  hydrate: () => Promise<void>;
  setAuthenticated: (hasInvite?: boolean) => void;
  clearSession: (reason?: string) => Promise<void>;
};

export const useSessionStore = create<SessionStore>((set, get) => ({
  status: "loading",
  hasInvite: false,
  hydrate: async () => {
    try {
      const tokens = await getAuthTokens();

      if (!tokens?.accessToken || !tokens?.refreshToken) {
        await get().clearSession("expired");
        return;
      }

      if (await isRefreshTokenExpired()) {
        await get().clearSession("expired");
        return;
      }

      set({
        status: "authenticated",
      });
    } catch (error) {
      console.error("Failed to hydrate session:", error);

      await get().clearSession("expired");
    }
  },

  setAuthenticated: (hasInvite?: boolean) => {
    set({
      status: "authenticated",
      hasInvite,
    });
  },

  clearSession: async (_reason?: string) => {
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
    } catch (error) {
      console.error("Failed to cancel queries or clear cache:", error);
    }

    try {
      await clearAuthTokens();
    } catch (error) {
      console.error("Failed to clear auth tokens:", error);
    }

    set({
      status: "unauthenticated",
    });
  },
}));
