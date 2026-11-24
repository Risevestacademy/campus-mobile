import { DESKS_QUERY_KEY } from "@shared/hooks/useDesks";
import { useWs } from "@shared/hooks/useWs";
import { useChatStore } from "@store/chat";
import { useWorldStore } from "@store/world";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";

/** Feeds every world message into the world and chat stores while mounted. */
export function useWorldSync() {
  const { subscribe, status } = useWs();
  const queryClient = useQueryClient();

  React.useEffect(
    () =>
      subscribe((message) => {
        // Read before applying: your own `spaceChanged` is told apart by id.
        const { selfId } = useWorldStore.getState();
        useWorldStore.getState().apply(message);

        const chat = useChatStore.getState();
        if (message.type === "said") {
          chat.say(message, selfId);
        } else if (
          message.type === "snapshot" ||
          (message.type === "spaceChanged" && message.userId === selfId)
        ) {
          // Chat is per space and world keeps none: a new space or a new
          // connection starts it empty.
          chat.clear();
        }

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
    if (status === "idle") {
      world.reset();
      useChatStore.getState().reset();
    } else if (status !== "open") world.markStale();
  }, [status]);
}
