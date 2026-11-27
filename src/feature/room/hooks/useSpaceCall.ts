import { useWs } from "@shared/hooks/useWs";
import type { Call } from "@shared/lib/generated/world-protocol";
import React from "react";

/** Claims of a JWT, read without verifying it. */
function decodeClaims(token: string): unknown {
  try {
    const payload = token.split(".")[1] ?? "";
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return "unreadable token";
  }
}

/** The protocol: a call token lets you join "for about ten minutes". */
const JOIN_WINDOW_MS = 10 * 60_000;

/** When `token` stops letting you join: its `exp`, else ten minutes from now. */
export function joinDeadline(token: string, now = Date.now()): number {
  const claims = decodeClaims(token);
  if (
    claims &&
    typeof claims === "object" &&
    "exp" in claims &&
    typeof claims.exp === "number"
  ) {
    return claims.exp * 1000;
  }
  return now + JOIN_WINDOW_MS;
}

export interface SpaceCall {
  /** Null when there's no call, or this device mustn't be in one. */
  call: Call | null;
  /**
   * True once `call` is for the space you're standing in. Each step into a
   * space sends a `spaceChanged` for you and a `call`, in either order; until
   * both have come, `call` may still be the last space's.
   */
  inSync: boolean;
  /** Epoch ms after which `call.token` no longer admits a join. */
  joinBy: number | null;
  nearbyUserIds: string[];
  /**
   * Somebody has come within earshot since this call arrived: in a proximity
   * space, the moment to start listening. Stays true for the call, so people
   * stepping in and out of range don't connect and disconnect it.
   */
  heard: boolean;
  /**
   * Gets fresh credentials: world sends them only on arrival or a step, so
   * this reopens the socket, resuming the avatar, which counts as arrival.
   */
  refresh: () => void;
}

type State = {
  call: Call | null;
  joinBy: number | null;
  /** Calls still owed: one on arrival, one per step. Zero means in sync. */
  owed: number;
  nearbyUserIds: string[];
  heard: boolean;
};

/** Nothing to join until world admits this socket and sends a call. */
const NO_CALL: State = {
  call: null,
  joinBy: null,
  owed: 1,
  nearbyUserIds: [],
  heard: false,
};

/**
 * Latest `call` credentials and `nearby` user ids from the world socket.
 * `nearby` can arrive before the `call` it applies to, so it is kept apart
 * and not reset when the call changes.
 *
 * Becoming a watcher (`watching`, `replaced`) or the socket going away for
 * good (sign-out, refusal) drops the call: only the device standing for you
 * may be in it.
 */
export function useSpaceCall(): SpaceCall {
  const [state, setState] = React.useState<State>(NO_CALL);
  const selfId = React.useRef<string | null>(null);
  const { subscribe, status, rejoin } = useWs();

  React.useEffect(
    () =>
      subscribe((message) => {
        switch (message.type) {
          case "welcome":
            // A fresh arrival: whatever came before was for another socket.
            selfId.current = message.userId;
            setState(NO_CALL);
            return;
          case "call":
            if (__DEV__ && message.call) {
              // Never the raw token: only the claims, to debug "invalid token".
              console.warn(
                "[call]",
                message.call.url,
                decodeClaims(message.call.token),
              );
            }
            setState((s) => ({
              ...s,
              call: message.call,
              joinBy: message.call ? joinDeadline(message.call.token) : null,
              owed: s.owed - 1,
              // `nearby` can come first: it counts for this call too.
              heard: s.nearbyUserIds.length > 0,
            }));
            return;
          case "spaceChanged":
            if (message.userId !== selfId.current) return;
            // Earshot belongs to the space you left; the new one sends its own.
            setState((s) => ({ ...s, owed: s.owed + 1, nearbyUserIds: [] }));
            return;
          case "nearby":
            setState((s) => ({
              ...s,
              nearbyUserIds: message.userIds,
              heard: s.heard || message.userIds.length > 0,
            }));
            return;
          case "watching":
          case "replaced":
            setState(NO_CALL);
            return;
        }
      }),
    [subscribe],
  );

  // Signed out, refused or replaced: the socket is gone and so is the call.
  const live = status === "open" || status === "connecting";
  const call = live ? state.call : null;

  return {
    call,
    inSync: call !== null && state.owed === 0,
    joinBy: call ? state.joinBy : null,
    nearbyUserIds: state.nearbyUserIds,
    heard: call !== null && state.heard,
    refresh: rejoin,
  };
}
