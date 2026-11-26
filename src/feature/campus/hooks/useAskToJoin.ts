import { useWs } from "@shared/hooks/useWs";
import type { EntryRequestOutcome } from "@shared/lib/generated/world-protocol";
import { useWorldStore } from "@store/world";
import React from "react";

/**
 * idle: nothing asked yet. walking: on the way to the door. waiting: asked,
 * for somebody inside to answer. entering: let in, walking through.
 * ended: the request is over without getting in; `reason` says why.
 */
export type AskPhase = "idle" | "walking" | "waiting" | "entering" | "ended";

/** Why a request ended without getting you in, as the screen words it. */
const ENDED: Partial<Record<EntryRequestOutcome, string>> = {
  declined: "They said no this time. You can ask again in 30 seconds.",
  withdrawn: "You withdrew your request.",
  walked_away: "You walked away from the door, so the request ended.",
  nobody_inside: "Nobody inside can let you in right now.",
  cancelled: "This space isn't taking requests any more.",
};

/**
 * Asking to enter a locked space. World only takes a request from beside the
 * space, so `ask` walks you to its door first: the walk stops there, refused,
 * and if somebody inside can answer, the request goes out. A yes walks you
 * in; so does the space being unlocked meanwhile.
 */
export function useAskToJoin(spaceKey: string) {
  const { send, subscribe } = useWs();
  const [phase, setPhase] = React.useState<AskPhase>("idle");
  const [reason, setReason] = React.useState<string | null>(null);
  const requestId = React.useRef<string | null>(null);
  // Read by the socket listener, which outlives renders.
  const asking = React.useRef(false);

  const end = (message: string) => {
    asking.current = false;
    requestId.current = null;
    setReason(message);
    setPhase("ended");
  };

  const walkIn = React.useCallback(() => {
    asking.current = false;
    requestId.current = null;
    setReason(null);
    setPhase("entering");
    send({ type: "goToSpace", spaceKey });
  }, [send, spaceKey]);

  React.useEffect(
    () =>
      subscribe((message) => {
        if (!asking.current) return;
        const selfId = useWorldStore.getState().selfId;

        switch (message.type) {
          case "walkEnded": {
            if (message.toSpaceKey !== spaceKey) return;
            if (message.reason === "arrived") {
              // Unlocked on the way: you're in.
              asking.current = false;
              setPhase("idle");
              return;
            }
            if (message.reason === "refused" && message.mayAsk) {
              send({ type: "requestEntry", spaceKey });
              return;
            }
            end(
              message.reason === "refused"
                ? "Nobody inside can let you in right now."
                : message.reason === "full"
                  ? "This space is full right now."
                  : "You didn't get to the door. Try again.",
            );
            return;
          }
          case "entryRequested":
            if (message.userId !== selfId || message.spaceKey !== spaceKey) {
              return;
            }
            requestId.current = message.requestId;
            setPhase("waiting");
            return;
          case "entryRequestEnded":
            if (message.requestId !== requestId.current) return;
            if (
              message.outcome === "admitted" ||
              message.outcome === "not_needed"
            ) {
              walkIn();
              return;
            }
            end(ENDED[message.outcome] ?? "Your request ended.");
            return;
          case "error":
            // World refused the request itself, e.g. asked again too soon.
            if (message.code === "NOT_ALLOWED" && !requestId.current) {
              end(message.message || "You can't ask to join right now.");
            }
            return;
        }
      }),
    [subscribe, send, spaceKey, walkIn],
  );

  /** Walks to the door and asks to come in. */
  const ask = () => {
    if (!send({ type: "goToSpace", spaceKey })) {
      end("You're not connected to campus right now.");
      return;
    }
    asking.current = true;
    requestId.current = null;
    setReason(null);
    setPhase("walking");
  };

  /** Withdraws the request; world confirms with its end. */
  const withdraw = () => {
    if (!requestId.current) return;
    send({ type: "withdrawEntryRequest", requestId: requestId.current });
  };

  return { phase, reason, ask, withdraw };
}
