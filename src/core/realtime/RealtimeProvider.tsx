import { getFreshAccessToken, refreshSession } from "@core/api";
import config from "@core/config";
import { WebSocketProvider } from "@shared/components/providers/ws";
import { useMe } from "@shared/hooks/useMe";
import { useSessionStore } from "@store/session";
import type { ReactNode } from "react";

import { useWorldSync } from "./useWorldSync";

function WorldSync() {
  useWorldSync();
  return null;
}

/** Connects to world once signed in with a cohort, and keeps the world store fed. */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const status = useSessionStore((state) => state.status);
  const { data: me } = useMe({ enabled: status === "authenticated" });
  const cohortId = me?.membership?.cohortId ?? null;

  return (
    <WebSocketProvider
      url={config.worldUrl}
      cohortId={cohortId}
      origin={config.webOrigin}
      getAccessToken={getFreshAccessToken}
      refreshSession={refreshSession}
    >
      <WorldSync />
      {children}
    </WebSocketProvider>
  );
}
