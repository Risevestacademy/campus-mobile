import { useWs } from "@shared/hooks/useWs";

import {
  type EntryRequestPhase,
  useEntryRequestFor,
  useEntryRequestStore,
} from "../store/entryRequest";

export type AskPhase = "idle" | EntryRequestPhase;

/**
 * Your request to enter `spaceKey`, and the actions on it. The request
 * itself lives in a store and is followed app-wide by
 * `useEntryRequestWatcher`, so it carries on when you leave the screen.
 */
export function useAskToJoin(spaceKey: string, spaceName: string) {
  const { send } = useWs();
  const request = useEntryRequestFor(spaceKey);

  /** Walks to the door and asks to come in. False when not connected. */
  const ask = () => {
    if (!send({ type: "goToSpace", spaceKey })) return false;
    useEntryRequestStore.getState().start(spaceKey, spaceName);
    return true;
  };

  /**
   * Withdraws the request: at once if world has named it, otherwise as
   * soon as it does. Still walking to the door, the walk stops too.
   */
  const cancel = () => {
    const { request: current, update, clear } = useEntryRequestStore.getState();
    if (!current || current.spaceKey !== spaceKey) return;
    if (current.phase === "ended") {
      clear();
      return;
    }
    if (current.requestId) {
      send({ type: "withdrawEntryRequest", requestId: current.requestId });
      update({ cancelling: true });
      return;
    }
    update({ cancelling: true });
    if (current.phase === "walking") send({ type: "stopWalking" });
  };

  return {
    phase: (request?.phase ?? "idle") as AskPhase,
    reason: request?.reason ?? null,
    ask,
    cancel,
  };
}
