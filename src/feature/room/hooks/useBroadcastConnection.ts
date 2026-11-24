import { useWs } from "@shared/hooks/useWs";
import type { BroadcastCall } from "@shared/lib/generated/world-protocol";
import React from "react";

import { explainJoinFailure } from "./explainJoinFailure";
import { joinDeadline } from "./useSpaceCall";

/** Waits between tries after a failed join or a lost room, then stays at the last. */
export const BROADCAST_RETRY_MS = [2_000, 10_000, 30_000];

/**
 * Keeps you in the broadcast room. Nobody chose to join it, so nobody is
 * asked to retry: a failed join or a lost room tries again on its own, with
 * backoff. A token past its window (a minute for speakers, ten for
 * listeners) can't get back in, so then it asks world for fresh credentials.
 */
export function useBroadcastConnection(call: BroadcastCall | null) {
  const { rejoin } = useWs();
  const [attempt, setAttempt] = React.useState(0);
  // Failures since the last time it got in, for the backoff.
  const [failures, setFailures] = React.useState(0);
  const [waiting, setWaiting] = React.useState(false);

  const connect = call !== null && !waiting;
  const roomKey = call ? `${call.room}#${attempt}` : null;

  // A disconnect from leaving on purpose (no call any more, the next try)
  // isn't a failure. Read by LiveKit's callbacks after the render moved on.
  const intended = React.useRef<string | null>(null);
  React.useEffect(() => {
    intended.current = connect ? roomKey : null;
  }, [connect, roomKey]);

  React.useEffect(() => {
    if (!waiting || !call) return;
    const delay =
      BROADCAST_RETRY_MS[Math.min(failures, BROADCAST_RETRY_MS.length) - 1] ??
      BROADCAST_RETRY_MS[0];
    const timer = setTimeout(() => {
      setWaiting(false);
      if (Date.now() >= joinDeadline(call.token)) {
        // World answers with a new `broadcast`, which this then joins.
        rejoin();
      } else {
        setAttempt((a) => a + 1);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [waiting, failures, call, rejoin]);

  // One identity per try: LiveKit reconnects whenever onError changes.
  const fail = React.useCallback(() => {
    if (!roomKey || intended.current !== roomKey) return;
    setFailures((f) => f + 1);
    setWaiting(true);
  }, [roomKey]);
  const onConnected = React.useCallback(() => setFailures(0), []);
  const onError = React.useCallback(
    (error: Error) => {
      console.warn("[broadcast]", error.message);
      // Once per room and token: the retries would only repeat it.
      if (call && failures === 0) {
        void explainJoinFailure("broadcast", call.url, call.token);
      }
      fail();
    },
    [fail, call, failures],
  );

  return { connect, roomKey, onConnected, onDisconnected: fail, onError };
}
