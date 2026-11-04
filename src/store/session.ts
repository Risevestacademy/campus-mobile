import {
  clearAuthTokens,
  getAuthTokens,
  getHasInvite,
  isRefreshTokenExpired,
  setHasInvite,
} from "@core/auth/tokenStorage";
import { queryClient } from "@shared/lib/react-query";
import { create } from "zustand";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

type SessionStore = {
  status: SessionStatus;
  hasInvite: boolean;

  hydrate: () => Promise<void>;
  setAuthenticated: (hasInvite?: boolean) => Promise<void>;
  clearHasInvite: () => Promise<void>;
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

      const hasInvite = await getHasInvite();

      set({
        status: "authenticated",
        hasInvite,
      });
    } catch (error) {
      console.error("Failed to hydrate session:", error);

      await get().clearSession("expired");
    }
  },

  setAuthenticated: async (hasInvite = false) => {
    try {
      await setHasInvite(hasInvite);
    } catch (error) {
      console.error("Failed to persist hasInvite state:", error);
    }

    set({
      status: "authenticated",
      hasInvite,
    });
  },

  clearHasInvite: async () => {
    try {
      await setHasInvite(false);
    } catch (error) {
      console.error("Failed to clear hasInvite state:", error);
    }

    set({
      hasInvite: false,
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
      hasInvite: false,
    });
  },
}));
