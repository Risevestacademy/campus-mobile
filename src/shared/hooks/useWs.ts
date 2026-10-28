import { WebSocketContext, type WebSocketState } from "@shared/lib/ws";
import React from "react";

export function useWs(): WebSocketState {
  const state = React.useContext(WebSocketContext);
  if (state === undefined) {
    throw new Error("useWs must be used inside WebSocketProvider");
  }
  return state;
}
