import { clearAuthTokens, getAuthTokens } from "@core/auth/tokenStorage";
import { create } from "zustand";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

type SessionStore = {
  status: SessionStatus;
  hasInvite: boolean;

  hydrate: () => Promise<void>;
  setAuthenticated: (hasInvite?: boolean) => void;
  clearSession: () => Promise<void>;
};

export const useSessionStore = create<SessionStore>((set) => ({
  status: "loading",
  hasInvite: false,
  hydrate: async () => {
    try {
      const tokens = await getAuthTokens();

      set({
        status: tokens?.accessToken ? "authenticated" : "unauthenticated",
      });
    } catch (error) {
      console.error("Failed to hydrate session:", error);

      set({
        status: "unauthenticated",
      });
    }
  },

  setAuthenticated: (hasInvite?: boolean) => {
    set({
      status: "authenticated",
      hasInvite,
    });
  },

  clearSession: async () => {
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
