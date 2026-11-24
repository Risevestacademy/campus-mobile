import { toast } from "@shared/components/atoms";
import { useWs } from "@shared/hooks/useWs";
import type { WalkEndReason } from "@shared/lib/generated/world-protocol";
import { useIsWatching, useWorldStore } from "@store/world";
import { useRouter } from "expo-router";
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
 * How long after our `goToSpace` an `error` frame counts as its answer: a key
 * that isn't on the map is refused with one, and no `walkEnded` follows.
 * Frames carry no id to match them by.
 */
const ANSWER_WINDOW_MS = 3_000;

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
  const router = useRouter();
  const watching = useIsWatching();
  const here = useWorldStore((state) =>
    state.selfId ? state.players[state.selfId]?.spaceKey === spaceKey : false,
  );
  const [stuck, setStuck] = React.useState<WalkEndReason | null>(null);
  // When our walk was asked for, and whether world began it (`walking`), so
  // an `error` can be told from one that answers something else.
  const askedAt = React.useRef(0);
  const walkBegan = React.useRef(false);

  const walk = React.useCallback(() => {
    setStuck(null);
    walkBegan.current = false;
    askedAt.current = Date.now();
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
        if (message.type === "walking" && message.toSpaceKey === spaceKey) {
          walkBegan.current = true;
          return;
        }
        if (
          message.type === "error" &&
          message.code !== "UNAUTHORIZED" &&
          askedAt.current > 0 &&
          !walkBegan.current &&
          Date.now() - askedAt.current <= ANSWER_WINDOW_MS
        ) {
          // World refused the walk itself, e.g. no such space on this map.
          askedAt.current = 0;
          console.warn("World refused goToSpace:", message.message);
          toast.error(
            "That space isn't available right now.",
            "Can't get there",
          );
          router.back();
          return;
        }
        if (message.type !== "walkEnded" || message.toSpaceKey !== spaceKey) {
          return;
        }
        setStuck(message.reason === "arrived" ? null : message.reason);
      }),
    [subscribe, spaceKey, router],
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
