import { registerSessionExpiredHandler } from "@core/api/middleware";
import {
  clearAuthTokens,
  getAuthTokens,
  isRefreshTokenExpired,
} from "@core/auth/tokenStorage";
import { queryClient } from "@shared/lib/react-query";
import { create } from "zustand";
import { combine } from "zustand/middleware";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

let hydrationPromise: Promise<void> | null = null;
let clearingPromise: Promise<void> | null = null;

export const useSessionStore = create(
  combine({ status: "loading" as SessionStatus }, (set) => {
    // Hydration may only resolve the initial "loading" state. If a login or
    // logout happened while storage was being read, that result wins.
    const resolveHydration = (status: Exclude<SessionStatus, "loading">) =>
      set((s) => (s.status === "loading" ? { status } : s));

    return {
      hydrate: (): Promise<void> => {
        if (hydrationPromise) {
          return hydrationPromise;
        }

        hydrationPromise = (async () => {
          try {
            const tokens = await getAuthTokens();
            if (!tokens?.accessToken) {
              resolveHydration("unauthenticated");
              return;
            }

            const expired = await isRefreshTokenExpired();
            if (expired) {
              try {
                await clearAuthTokens();
              } catch (error) {
                console.error("Error clearing expired auth tokens:", error);
              }
              resolveHydration("unauthenticated");
              return;
            }

            resolveHydration("authenticated");
          } catch (error) {
            console.error("Failed to hydrate session tokens:", error);
            resolveHydration("unauthenticated");
          }
        })();

        return hydrationPromise;
      },

      setAuthenticated: () => {
        set({ status: "authenticated" });
      },

      clearSession: (): Promise<void> => {
        // Concurrent 401s share one in-flight teardown.
        if (clearingPromise) {
          return clearingPromise;
        }

        clearingPromise = (async () => {
          try {
            // 1. Tokens first, so any refetch triggered later cannot authenticate.
            try {
              await clearAuthTokens();
            } catch (error) {
              console.error("Error clearing auth tokens:", error);
            }

            // 2. Flip status so the route guard unmounts protected screens.
            set({ status: "unauthenticated" });

            // 3. Stop in-flight requests, then drop cached user data.
            try {
              await queryClient.cancelQueries();
            } catch (error) {
              console.error("Error cancelling queries:", error);
            }
            queryClient.clear();
          } finally {
            // Allow a future re-hydrate and a future logout after re-login.
            hydrationPromise = null;
            clearingPromise = null;
          }
        })();

        return clearingPromise;
      },
    };
  }),
);

registerSessionExpiredHandler(async () => {
  await useSessionStore.getState().clearSession();
});
