import { DESKS_QUERY_KEY } from "@shared/hooks/useDesks";
import { useWs } from "@shared/hooks/useWs";
import { useWorldStore } from "@store/world";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";

/** Feeds every world message into the world store while mounted. */
export function useWorldSync() {
  const { subscribe, status } = useWs();
  const queryClient = useQueryClient();

  React.useEffect(
    () =>
      subscribe((message) => {
        useWorldStore.getState().apply(message);
        // Desks live in campus-api; world only says when they changed.
        if (message.type === "desksChanged") {
          void queryClient.invalidateQueries({ queryKey: DESKS_QUERY_KEY });
        }
      }),
    [subscribe, queryClient],
  );

  React.useEffect(() => {
    const world = useWorldStore.getState();
    // idle: signed out or no cohort, so nothing on screen should survive.
    if (status === "idle") world.reset();
    else if (status !== "open") world.markStale();
  }, [status]);
}
