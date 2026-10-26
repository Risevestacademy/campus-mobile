import {
  type ServerMessageOf,
  type ServerMessageType,
  WebSocketContext,
  type WebSocketState,
} from "@shared/lib/ws";
import React from "react";

export function useWs(): WebSocketState {
  const state = React.useContext(WebSocketContext);
  if (state === undefined) {
    throw new Error("useWs must be used inside WebSocketProvider");
  }
  return state;
}

/**
 * Calls `handler` with each server message of `type`, typed to match:
 * `useWsMessage("snapshot", (m) => m.players)`. The latest handler is used
 * without resubscribing.
 */
export function useWsMessage<T extends ServerMessageType>(
  type: T,
  handler: (message: ServerMessageOf<T>) => void,
) {
  const { subscribe } = useWs();
  const onMessage = React.useEffectEvent(handler);

  React.useEffect(
    () =>
      subscribe((message) => {
        if (message.type === type) onMessage(message as ServerMessageOf<T>);
      }),
    [subscribe, type],
  );
}
