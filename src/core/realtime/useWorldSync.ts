import { useWs } from "@shared/hooks/useWs";
import { useWorldStore } from "@store/world";
import React from "react";

/** Feeds every world message into the world store while mounted. */
export function useWorldSync() {
  const { subscribe, status } = useWs();

  React.useEffect(() => subscribe(useWorldStore.getState().apply), [subscribe]);

  React.useEffect(() => {
    const world = useWorldStore.getState();
    // idle: signed out or no cohort, so nothing on screen should survive.
    if (status === "idle") world.reset();
    else if (status !== "open") world.markStale();
  }, [status]);
}
