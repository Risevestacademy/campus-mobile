import { toast } from "@shared/components/atoms";
import { useWs } from "@shared/hooks/useWs";
import type { Status } from "@shared/lib/generated/world-protocol";
import { useMyStatus, useMyStatusUntil, useWorldStore } from "@store/world";
import React from "react";

/**
 * How long after a `setStatus` an `error` frame counts as its answer. World
 * answers in order and quickly; frames carry no id to match them by.
 */
const ANSWER_WINDOW_MS = 3_000;

/**
 * Your status as world last reported it, when it ends if you chose it for a
 * while, and a way to change it. A change shows once world echoes it back
 * as `statusChanged`, not before; if world refuses it instead, it says so.
 */
export function useAvailability() {
  const { send, subscribe } = useWs();
  const status = useMyStatus();
  const until = useMyStatusUntil();
  // When the last setStatus went out, until world answers it.
  const sentAt = React.useRef<number | null>(null);

  React.useEffect(
    () =>
      subscribe((message) => {
        if (sentAt.current === null) return;
        if (Date.now() - sentAt.current > ANSWER_WINDOW_MS) {
          sentAt.current = null;
          return;
        }
        const { selfId } = useWorldStore.getState();
        if (message.type === "statusChanged" && message.userId === selfId) {
          sentAt.current = null;
        } else if (
          message.type === "error" &&
          message.code !== "UNAUTHORIZED"
        ) {
          sentAt.current = null;
          console.warn("World refused setStatus:", message.message);
          toast.error(
            "Campus didn't accept that change. Try again in a moment.",
            "Status not changed",
          );
        }
      }),
    [subscribe],
  );

  /** `forSeconds` sets it for that long only; leave it out for one that lasts. */
  const setStatus = (next: Status, forSeconds?: number) => {
    const sent = send({
      type: "setStatus",
      status: next,
      ...(forSeconds ? { forSeconds } : {}),
    });
    if (!sent) {
      toast.error("You're not connected to campus. Try again in a moment.");
      return;
    }
    sentAt.current = Date.now();
  };

  return { status, until, setStatus };
}
