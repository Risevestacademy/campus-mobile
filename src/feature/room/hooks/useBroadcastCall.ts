import { useWs } from "@shared/hooks/useWs";
import type { BroadcastCall } from "@shared/lib/generated/world-protocol";
import React from "react";

/**
 * The cohort's broadcast room credentials, from world's `broadcast` frame:
 * sent on arrival and again when you're made or stop being an admin. Null
 * where there's no room to join. Becoming a watcher (`watching`, `replaced`)
 * or the socket going away for good drops it: only the device standing for
 * you is in the broadcast room.
 */
export function useBroadcastCall(): BroadcastCall | null {
  const [call, setCall] = React.useState<BroadcastCall | null>(null);
  const { subscribe, status } = useWs();

  React.useEffect(
    () =>
      subscribe((message) => {
        switch (message.type) {
          case "welcome":
          case "watching":
          case "replaced":
            // A new connection sends its own; a watcher gets none.
            setCall(null);
            return;
          case "broadcast":
            setCall(message.call);
            return;
        }
      }),
    [subscribe],
  );

  const live = status === "open" || status === "connecting";
  return live ? call : null;
}
