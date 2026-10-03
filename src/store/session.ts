import { registerSessionExpiredHandler } from "@core/api/middleware";
import {
  clearAuthTokens,
  getAuthTokens,
  isRefreshTokenExpired,
} from "@core/auth/tokenStorage";
import { queryClient } from "@shared/lib/react-query";
import { create } from "zustand";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

interface SessionState {
  status: SessionStatus;
  hydrate: () => Promise<void>;
  setAuthenticated: () => void;
  clearSession: () => Promise<void>;
}

let hydrationPromise: Promise<void> | null = null;

export const useSessionStore = create<SessionState>((set) => ({
  status: "loading",

  hydrate: () => {
    if (hydrationPromise) {
      return hydrationPromise;
    }

    hydrationPromise = (async () => {
      try {
        const tokens = await getAuthTokens();
        if (!tokens?.accessToken) {
          set({ status: "unauthenticated" });
          return;
        }

        const expired = await isRefreshTokenExpired();
        if (expired) {
          await clearAuthTokens();
          set({ status: "unauthenticated" });
          return;
        }

        set({ status: "authenticated" });
      } catch (error) {
        console.error("Failed to hydrate session tokens:", error);
        set({ status: "unauthenticated" });
      }
    })();

    return hydrationPromise;
  },

  setAuthenticated: () => {
    set({ status: "authenticated" });
  },

  clearSession: async () => {
    try {
      await clearAuthTokens();
    } catch (error) {
      console.error("Error clearing auth tokens:", error);
    }
    queryClient.clear();
    set({ status: "unauthenticated" });
  },
}));

registerSessionExpiredHandler(async () => {
  await useSessionStore.getState().clearSession();
});
