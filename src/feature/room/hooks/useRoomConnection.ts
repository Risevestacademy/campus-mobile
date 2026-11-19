import { useWs } from "@shared/hooks/useWs";
import type { WalkEndReason } from "@shared/lib/generated/world-protocol";
import { useIsWatching, useWorldStore } from "@store/world";
import React from "react";

import { useSpaceCallContext } from "../providers/SpaceCallProvider";

/**
 * watching: another device stands for you, so this one stays out.
 * walking: not in the space yet; the room waits for you to arrive.
 * stuck: the walk there ended without arriving.
 * waiting: there, but world hasn't sent this space's call yet.
 * refreshing: the call's token is too old to join; getting a fresh one.
 * joining / connected: in the LiveKit room, or getting in.
 * failed: the join itself failed. dropped: the call was lost after joining
 * and LiveKit gave up reconnecting. Both offer `retry`.
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

/** Ask for fresh credentials this long before the token stops working. */
const EXPIRY_MARGIN_MS = 15_000;

type Outcome = { key: string; phase: "connected" | "failed" | "dropped" };

/**
 * Whether, and with what, to connect to `spaceKey`'s call. Connects only once
 * you are standing in that space and world has sent its call, so opening a
 * space never puts you in the conversation you were in before. Opening the
 * screen walks you there.
 */
export function useRoomConnection(spaceKey: string) {
  const { call, inSync, joinBy, refresh } = useSpaceCallContext();
  const { send, subscribe } = useWs();
  const watching = useIsWatching();
  const here = useWorldStore((state) =>
    state.selfId ? state.players[state.selfId]?.spaceKey === spaceKey : false,
  );
  const [attempt, setAttempt] = React.useState(0);
  const [outcome, setOutcome] = React.useState<Outcome | null>(null);
  const [stuck, setStuck] = React.useState<WalkEndReason | null>(null);
  // The token that's too old to join with, once its time is up.
  const [expiredToken, setExpiredToken] = React.useState<string | null>(null);
  // The token a refresh was asked for, so each token is refreshed once.
  const refreshedFor = React.useRef<string | null>(null);

  // Marks the token expired when its join window closes, even while you wait.
  const token = call?.token ?? null;
  React.useEffect(() => {
    if (!token || joinBy === null) return;
    const timer = setTimeout(
      () => setExpiredToken(token),
      Math.max(0, joinBy - EXPIRY_MARGIN_MS - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [token, joinBy]);

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

  const ready = call !== null && inSync && here;
  const key = call ? `${call.token}#${attempt}` : null;
  const settled = outcome && outcome.key === key ? outcome.phase : null;
  // A token that has already let you in doesn't need replacing.
  const expired =
    ready &&
    settled !== "connected" &&
    token !== null &&
    expiredToken === token;

  const phase: RoomPhase = watching
    ? "watching"
    : !here
      ? stuck
        ? "stuck"
        : "walking"
      : !ready
        ? "waiting"
        : settled === "failed" || settled === "dropped"
          ? settled
          : expired
            ? "refreshing"
            : (settled ?? "joining");

  React.useEffect(() => {
    if (phase !== "refreshing" || !token || refreshedFor.current === token) {
      return;
    }
    refreshedFor.current = token;
    refresh();
  }, [phase, token, refresh]);

  const connect = phase === "joining" || phase === "connected";
  // Read by LiveKit's callbacks, which fire after the render that unmounted
  // the room: leaving on purpose (walking out, a new try) isn't a failure.
  const intended = React.useRef<string | null>(null);
  React.useEffect(() => {
    intended.current = connect ? key : null;
  }, [connect, key]);

  const settle = (next: Outcome["phase"]) => {
    if (!key || intended.current !== key) return;
    setOutcome((prev) =>
      next === "failed" && prev?.key === key && prev.phase === "connected"
        ? { key, phase: "dropped" }
        : { key, phase: next },
    );
  };

  /** Join again; with fresh credentials when the token has run out. */
  const retry = () => {
    if (token && expiredToken === token) {
      refreshedFor.current = token;
      setOutcome(null);
      refresh();
      return;
    }
    setAttempt((a) => a + 1);
  };

  return {
    phase,
    call,
    connect,
    /** Remounts the LiveKit room for each try. */
    roomKey: call ? `${call.room}#${attempt}` : null,
    stuckReason: stuck,
    onConnected: () => settle("connected"),
    // Before connecting, a disconnect is a failed join; after, a lost call.
    onDisconnected: () => settle("failed"),
    onError: () => settle("failed"),
    retry,
    walk,
  };
}
