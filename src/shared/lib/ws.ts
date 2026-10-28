import { createContext } from "react";

import type {
  ClientMessage,
  CloseReason,
  ServerMessage,
} from "./generated/world-protocol";

export type { ClientMessage, ServerMessage };

export type ServerMessageListener = (message: ServerMessage) => void;

/**
 * idle: signed out or no cohort, so nothing to connect to.
 * connecting: dialing, or waiting to retry (including while backgrounded).
 * open: `socket` is usable.
 * replaced: this account opened the cohort elsewhere; call `reconnect` only
 *   when the person asks to come back here.
 * refused: world turned the socket away for good; see `closeReason`.
 */
export type WebSocketStatus =
  "idle" | "connecting" | "open" | "replaced" | "refused";

export type WebSocketState = {
  socket: WebSocket | null;
  status: WebSocketStatus;
  /** World's close reason when status is `replaced` or `refused`. */
  closeReason: string | null;
  /** Start over after `replaced` or `refused`. */
  reconnect: () => void;
  /** Sends when open; returns false (and drops it) otherwise. */
  send: (message: ClientMessage) => boolean;
  /**
   * Every server frame, from the first one on each socket. Works before the
   * socket opens, so `welcome` and `snapshot` aren't missed. Returns unsubscribe.
   */
  subscribe: (listener: ServerMessageListener) => () => void;
};

// `undefined` means "no provider above".
export const WebSocketContext = createContext<WebSocketState | undefined>(
  undefined,
);

export type CloseAction =
  "reconnect" | "refresh" | "signOut" | "stop" | "replaced";

// What docs/world-protocol.md says to do for each reason world closes with.
// A Record, so a reason added to the schema fails typecheck until handled.
const CLOSE_REASON_ACTIONS: Record<CloseReason, CloseAction> = {
  no_token: "signOut",
  token_not_usable: "refresh",
  session_expired: "refresh",
  session_ended: "refresh",
  session_revoked: "signOut",
  wrong_scope: "stop",
  account_suspended: "signOut",
  account_gone: "signOut",
  origin_not_allowed: "stop",
  no_cohort: "stop",
  not_a_member: "stop",
  rate_limited: "reconnect",
  entered_elsewhere: "replaced",
  "server shutting down": "reconnect",
  internal_error: "reconnect",
};

const ENTERED_ELSEWHERE = 4000;
const POLICY_VIOLATION = 1008;

export function closeAction(code: number, reason: string): CloseAction {
  if (code === ENTERED_ELSEWHERE) return "replaced";
  // 1001, 1011, and the client-side 1006/1009: transient.
  if (code !== POLICY_VIOLATION) return "reconnect";
  // Never retry a refusal we don't understand.
  return Object.prototype.hasOwnProperty.call(CLOSE_REASON_ACTIONS, reason)
    ? CLOSE_REASON_ACTIONS[reason as CloseReason]
    : "stop";
}

/** world admits a socket to the cohort named on the upgrade. */
export function withCohort(url: string, cohortId: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}cohortId=${encodeURIComponent(cohortId)}`;
}

// React Native's WebSocket accepts a third `options` argument for headers,
// but the DOM typings it inherits only declare (url, protocols).
type NativeWebSocketConstructor = new (
  url: string,
  protocols?: string | string[] | null,
  options?: { headers?: Record<string, string> },
) => WebSocket;

export function createWebSocket(
  url: string,
  headers: Record<string, string>,
): WebSocket {
  const NativeWebSocket = WebSocket as unknown as NativeWebSocketConstructor;
  return new NativeWebSocket(url, null, { headers });
}

/** Any JSON object with a string `type`; the shape is world's to guarantee. */
export function parseServerMessage(data: unknown): ServerMessage | null {
  if (typeof data !== "string") return null;
  try {
    const frame: unknown = JSON.parse(data);
    if (typeof frame !== "object" || frame === null) return null;
    if (typeof (frame as { type?: unknown }).type !== "string") return null;
    return frame as ServerMessage;
  } catch {
    return null;
  }
}
