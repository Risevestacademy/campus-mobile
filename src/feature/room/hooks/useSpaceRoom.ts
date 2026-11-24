import { useIsWatching } from "@store/world";
import { type Room, RoomEvent } from "livekit-client";
import React from "react";

import { useSpaceCallContext } from "../providers/SpaceCallProvider";
import { explainJoinFailure } from "./explainJoinFailure";

/**
 * idle: nothing to join (no call, not in sync, watching, or nobody to hear).
 * refreshing: the call's token is too old to join; getting a fresh one.
 * connecting / connected: in the LiveKit room, or getting in.
 * failed: the join failed. dropped: the call was lost after joining and
 * LiveKit gave up reconnecting. Both wait for `retry`.
 */
export type SpaceRoomPhase =
  "idle" | "refreshing" | "connecting" | "connected" | "failed" | "dropped";

/** Ask for fresh credentials this long before the token stops working. */
const EXPIRY_MARGIN_MS = 15_000;

type Outcome = { key: string; phase: "connected" | "failed" | "dropped" };

/**
 * Runs the call for the space you're standing in, app-wide, on one `Room`.
 *
 * It listens without anybody opening the space: in a proximity space as soon
 * as `nearby` names somebody, in a whole-room space straight away. A space
 * screen being open (`open`) joins too. The microphone stays off.
 *
 * `room.connect()` runs once per token and try, from one effect whose cleanup
 * disconnects: nothing else can start a join, so a re-render can never
 * restart one mid-way.
 */
export function useSpaceRoom(room: Room) {
  const { call, inSync, heard, joinBy, refresh } = useSpaceCallContext();
  const watching = useIsWatching();
  // Space screens asking to be in the call, whoever is in earshot.
  const [openScreens, setOpenScreens] = React.useState(0);
  const [attempt, setAttempt] = React.useState(0);
  const [outcome, setOutcome] = React.useState<Outcome | null>(null);
  const [expiredToken, setExpiredToken] = React.useState<string | null>(null);
  const refreshedFor = React.useRef<string | null>(null);

  const token = call?.token ?? null;
  const url = call?.url ?? null;
  const proximity = call?.hearing === "proximity";
  const key = token ? `${token}#${attempt}` : null;
  const settled = outcome && outcome.key === key ? outcome.phase : null;

  // Marks the token too old once its join window closes, even while idle.
  React.useEffect(() => {
    if (!token || joinBy === null) return;
    const timer = setTimeout(
      () => setExpiredToken(token),
      Math.max(0, joinBy - EXPIRY_MARGIN_MS - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [token, joinBy]);

  const wanted =
    call !== null &&
    inSync &&
    !watching &&
    (!proximity || heard || openScreens > 0);
  // A token that already let you in doesn't need replacing.
  const expired =
    token !== null && expiredToken === token && settled !== "connected";

  const phase: SpaceRoomPhase = !wanted
    ? "idle"
    : settled === "failed" || settled === "dropped"
      ? settled
      : expired
        ? "refreshing"
        : (settled ?? "connecting");
  const connect = phase === "connecting" || phase === "connected";

  React.useEffect(() => {
    if (phase !== "refreshing" || !token || refreshedFor.current === token) {
      return;
    }
    refreshedFor.current = token;
    refresh();
  }, [phase, token, refresh]);

  React.useEffect(() => {
    if (!connect || !key || !url || !token) return;
    // Already too old: the expiry timer marks it at once and a refresh
    // follows, rather than a join that can only fail.
    if (joinBy !== null && Date.now() >= joinBy - EXPIRY_MARGIN_MS) return;
    let current = true;

    const onDisconnected = () => {
      if (!current) return;
      // Before connecting it's a failed join; after, a lost call.
      setOutcome((prev) =>
        prev?.key === key && prev.phase === "connected"
          ? { key, phase: "dropped" }
          : { key, phase: "failed" },
      );
    };
    room.on(RoomEvent.Disconnected, onDisconnected);

    room
      // Proximity: hear only who `nearby` names, not the whole room.
      .connect(url, token, { autoSubscribe: !proximity })
      .then(() => {
        if (current) setOutcome({ key, phase: "connected" });
      })
      .catch((error: unknown) => {
        if (!current) return;
        console.warn(
          "[room] couldn't join:",
          error instanceof Error ? error.message : error,
        );
        void explainJoinFailure("room", url, token);
        setOutcome({ key, phase: "failed" });
      });

    return () => {
      // Ours: leaving the space, a new token or try, or nobody to hear.
      current = false;
      room.off(RoomEvent.Disconnected, onDisconnected);
      void room.disconnect();
    };
    // `connect` flips only between joining and not; `key` covers the token
    // and the try, so this joins exactly once for each.
  }, [connect, key, url, token, joinBy, proximity, room]);

  /** Join again; with fresh credentials when the token has run out. */
  const retry = React.useCallback(() => {
    if (token && expiredToken === token) {
      refreshedFor.current = token;
      setOutcome(null);
      refresh();
      return;
    }
    setAttempt((a) => a + 1);
  }, [token, expiredToken, refresh]);

  /** A space screen is open: join even if nobody is in earshot. */
  const open = React.useCallback(() => {
    setOpenScreens((n) => n + 1);
    return () => setOpenScreens((n) => n - 1);
  }, []);

  return { phase, retry, open };
}
