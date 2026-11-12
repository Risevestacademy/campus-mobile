import { useWs } from "@shared/hooks/useWs";
import type { Call } from "@shared/lib/generated/world-protocol";
import React from "react";

/** Claims of a JWT, read without verifying it. For dev logs only. */
function decodeClaims(token: string): unknown {
  try {
    const payload = token.split(".")[1] ?? "";
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return "unreadable token";
  }
}

export interface SpaceCall {
  call: Call | null;
  nearbyUserIds: string[];
}

/**
 * Latest `call` credentials and `nearby` user ids from the world socket.
 * `nearby` can arrive before the `call` it applies to, so it is kept apart
 * and not reset when the call changes.
 */
export function useSpaceCall(): SpaceCall {
  const [call, setCall] = React.useState<Call | null>(null);
  const [nearbyUserIds, setNearbyUserIds] = React.useState<string[]>([]);

  const { subscribe } = useWs();

  React.useEffect(
    () =>
      subscribe((message) => {
        if (message.type === "call") {
          if (__DEV__ && message.call) {
            // Never the raw token: only the claims, to debug "invalid token".
            console.warn(
              "[call]",
              message.call.url,
              decodeClaims(message.call.token),
            );
          }
          setCall(message.call);
        } else if (message.type === "nearby") {
          setNearbyUserIds(message.userIds);
        }
      }),
    [subscribe],
  );

  return { call, nearbyUserIds };
}
