import { useWs } from "@shared/hooks/useWs";
import type { WalkEndReason } from "@shared/lib/generated/world-protocol";
import { useIsWatching, useWorldStore } from "@store/world";
import React from "react";

import { useSpaceCallContext } from "../providers/SpaceCallProvider";
import { useSpaceRoomContext } from "../providers/SpaceRoomHost";

/**
 * watching: another device stands for you, so this one stays out.
 * walking: not in the space yet; the room waits for you to arrive.
 * stuck: the walk there ended without arriving.
 * waiting: there, but world hasn't sent this space's call yet.
 * refreshing / joining / connected / failed / dropped: the app-wide call's
 * own phase (see `useSpaceRoom`).
 */
export type RoomPhase =
  | "watching"
  | "walking"
  | "stuck"
  | "waiting"
  | "refreshing"
  | "joining"
  | "connected"
  | "failed"
  | "dropped";

/**
 * What the space screen shows for `spaceKey`. The call itself runs app-wide
 * in `SpaceRoomHost`; this walks you there, and once you're in the space asks
 * the host to join even if nobody is in earshot yet, so opening a space
 * never puts you in the conversation you were in before.
 */
export function useRoomConnection(spaceKey: string) {
  const { inSync } = useSpaceCallContext();
  const host = useSpaceRoomContext();
  const { send, subscribe } = useWs();
  const watching = useIsWatching();
  const here = useWorldStore((state) =>
    state.selfId ? state.players[state.selfId]?.spaceKey === spaceKey : false,
  );
  const [stuck, setStuck] = React.useState<WalkEndReason | null>(null);

  const walk = React.useCallback(() => {
    setStuck(null);
    send({ type: "goToSpace", spaceKey });
  }, [send, spaceKey]);

  // "Join class" and the like only open the screen: walk there from here.
  const startedHere = React.useRef(here);
  React.useEffect(() => {
    if (!startedHere.current && !watching) walk();
    // Once per space: later changes are you walking, not the screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaceKey]);

  React.useEffect(
    () =>
      subscribe((message) => {
        if (message.type !== "walkEnded" || message.toSpaceKey !== spaceKey) {
          return;
        }
        setStuck(message.reason === "arrived" ? null : message.reason);
      }),
    [subscribe, spaceKey],
  );

  // The screen is open on the space you're in: be in its call.
  const { open } = host;
  React.useEffect(() => {
    if (here && !watching) return open();
  }, [here, watching, open]);

  const phase: RoomPhase = watching
    ? "watching"
    : !here
      ? stuck
        ? "stuck"
        : "walking"
      : !inSync || host.phase === "idle"
        ? "waiting"
        : host.phase === "connecting"
          ? "joining"
          : host.phase;

  return { phase, stuckReason: stuck, retry: host.retry, walk };
}
