import { toast } from "@shared/components/atoms";
import { useWs } from "@shared/hooks/useWs";
import type { EntryRequestOutcome } from "@shared/lib/generated/world-protocol";
import { useWorldStore } from "@store/world";
import React from "react";

import { useEntryRequestStore } from "../store/entryRequest";

/** Why a request ended without getting you in, as the app words it. */
const ENDED: Partial<Record<EntryRequestOutcome, string>> = {
  declined: "They said no this time. You can ask again in 30 seconds.",
  walked_away: "You walked away from the door, so the request ended.",
  nobody_inside: "Nobody inside can let you in right now.",
  cancelled: "This space isn't taking requests any more.",
};

/**
 * Follows your request to enter a locked space for as long as it's open,
 * whatever screen you're on. Mount it once, app-wide.
 *
 * World takes a request only from beside the space: the walk to the door
 * stops there, refused, and the request goes out. A yes walks you in. The
 * answer pings you with a toast, so you can leave the lobby meanwhile. A
 * cancel made before world named the request withdraws it once it does.
 */
export function useEntryRequestWatcher() {
  const { send, subscribe } = useWs();

  React.useEffect(
    () =>
      subscribe((message) => {
        const { request, update, clear } = useEntryRequestStore.getState();
        if (!request) return;
        const { spaceKey, spaceName } = request;

        const end = (reason: string) => {
          update({ phase: "ended", reason, requestId: null });
          toast.error(reason, `Not let into ${spaceName}`);
        };

        switch (message.type) {
          case "walkEnded": {
            if (message.toSpaceKey !== spaceKey) return;
            if (message.reason === "arrived") {
              // Walked in: let in, or unlocked on the way.
              clear();
              return;
            }
            if (request.cancelling || request.phase !== "walking") {
              // Stopped on purpose, or the walk in after a yes didn't make it.
              if (request.cancelling) clear();
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
          case "entryRequested": {
            const selfId = useWorldStore.getState().selfId;
            if (message.userId !== selfId || message.spaceKey !== spaceKey) {
              return;
            }
            if (request.cancelling) {
              // Cancelled before world named it: withdraw it now.
              send({
                type: "withdrawEntryRequest",
                requestId: message.requestId,
              });
              return;
            }
            update({ phase: "waiting", requestId: message.requestId });
            return;
          }
          case "entryRequestEnded": {
            if (
              message.spaceKey !== spaceKey ||
              message.userId !== useWorldStore.getState().selfId
            ) {
              return;
            }
            if (message.outcome === "withdrawn" || request.cancelling) {
              clear();
              return;
            }
            if (
              message.outcome === "admitted" ||
              message.outcome === "not_needed"
            ) {
              update({ phase: "entering", requestId: null });
              send({ type: "goToSpace", spaceKey });
              toast.success(`You're in ${spaceName}`);
              return;
            }
            end(ENDED[message.outcome] ?? "Your request ended.");
            return;
          }
          case "error":
            // World refused to take the request, e.g. asked again too soon.
            if (
              message.code === "NOT_ALLOWED" &&
              request.phase === "walking" &&
              !request.cancelling
            ) {
              end(message.message || "You can't ask to join right now.");
            }
            return;
        }
      }),
    [subscribe, send],
  );
}
