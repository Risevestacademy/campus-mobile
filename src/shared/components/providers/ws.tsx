import {
  type ClientMessage,
  closeAction,
  createWebSocket,
  parseServerMessage,
  type ServerMessageListener,
  WebSocketContext,
  type WebSocketState,
  withCohort,
} from "@shared/lib/ws";
import { useSessionStore } from "@store/session";
import React from "react";
import { AppState } from "react-native";

export const INITIAL_RETRY_DELAY_MS = 1_000;
export const MAX_RETRY_DELAY_MS = 30_000;

// Client-side code for a connection lost without a close frame.
const ABNORMAL_CLOSURE = 1006;

type ConnectionState = Omit<WebSocketState, "reconnect" | "send" | "subscribe">;

const IDLE: ConnectionState = {
  socket: null,
  status: "idle",
  closeReason: null,
};
const CONNECTING: ConnectionState = {
  socket: null,
  status: "connecting",
  closeReason: null,
};

function retryDelay(attempt: number): number {
  const delay = Math.min(
    INITIAL_RETRY_DELAY_MS * 2 ** attempt,
    MAX_RETRY_DELAY_MS,
  );
  // Jitter so clients don't all reconnect at once after a server restart.
  return delay / 2 + Math.random() * (delay / 2);
}

export function WebSocketProvider({
  url,
  cohortId,
  origin,
  getAccessToken,
  refreshSession,
  children,
}: {
  url: string;
  /** world admits a socket to one cohort; nothing connects without one. */
  cohortId: string | null;
  /**
   * Sent as `Origin`. RN otherwise derives one from `url`, which world refuses
   * with `origin_not_allowed`.
   */
  origin?: string;
  /** The current access token, sent as a bearer token on the upgrade. */
  getAccessToken: () => Promise<string | null>;
  /** Refreshes the session; resolves true when it succeeded. */
  refreshSession: () => Promise<boolean>;
  children: React.ReactNode;
}) {
  const status = useSessionStore((s) => s.status);
  const [connection, setConnection] =
    React.useState<ConnectionState>(CONNECTING);
  // Bumped by `reconnect` to restart the effect after replaced/refused.
  const [generation, setGeneration] = React.useState(0);
  const onRefresh = React.useEffectEvent(() => refreshSession());
  // Outlives sockets, so subscribers attached before a socket opens get its
  // first frames too.
  const listeners = React.useRef(new Set<ServerMessageListener>());
  const readToken = React.useEffectEvent(() => getAccessToken());

  React.useEffect(() => {
    if (status !== "authenticated" || !cohortId) return;

    const socketUrl = withCohort(url, cohortId);
    let ws: WebSocket | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;
    let disposed = false;
    // Set once world gives a final answer (replaced, refused, sign out);
    // only `reconnect` or a change of session/cohort starts again.
    let stopped = false;
    // A refresh already failed to get us back in since the last admission.
    let refreshed = false;
    // iOS suspends backgrounded apps, leaving sockets that look open but are
    // dead. Drop the connection in the background and reopen on return.
    let paused = AppState.currentState === "background";
    // Bumped by each connect and by teardown, so a token read that resolves
    // after a newer attempt (or after teardown) is dropped.
    let dial = 0;

    const scheduleRetry = () => {
      if (disposed || paused || stopped) return;
      retryTimer = setTimeout(() => void connect(), retryDelay(attempt));
      attempt += 1;
    };

    const stop = (next: "replaced" | "refused", reason: string) => {
      stopped = true;
      setConnection({ socket: null, status: next, closeReason: reason });
    };

    const signOut = (reason: string) => {
      stopped = true;
      void useSessionStore.getState().clearSession(reason);
    };

    const refreshThenConnect = (reason: string) => {
      if (refreshed) {
        signOut(reason);
        return;
      }
      void onRefresh()
        .catch(() => false)
        .then((ok) => {
          if (disposed || stopped) return;
          if (!ok) {
            // Transient failure; a rejected refresh has already signed out.
            scheduleRetry();
            return;
          }
          refreshed = true;
          if (!paused) void connect();
        });
    };

    const connect = async () => {
      const current = ++dial;
      // The token is saved after the session flips to authenticated, so it
      // can be missing for a moment; keep polling for it.
      let next: WebSocket;
      try {
        const token = await readToken();
        if (current !== dial || disposed || paused || stopped) return;
        if (!token) {
          scheduleRetry();
          return;
        }
        next = createWebSocket(socketUrl, {
          Authorization: `Bearer ${token}`,
          ...(origin ? { Origin: origin } : {}),
        });
      } catch (error) {
        // connect also runs from timers and listeners, where a throw would
        // escape as an unhandled error. Treat it as one more failed attempt.
        console.error("Failed to open world socket:", error);
        scheduleRetry();
        return;
      }
      ws = next;

      let heartbeat: ReturnType<typeof setInterval> | undefined;
      let awaitingReply = false;

      const handleClosed = (code: number, reason: string) => {
        clearInterval(heartbeat);
        if (ws !== next) return;
        ws = null;

        switch (closeAction(code, reason)) {
          case "reconnect":
            setConnection(CONNECTING);
            scheduleRetry();
            return;
          case "refresh":
            setConnection(CONNECTING);
            refreshThenConnect(reason);
            return;
          case "replaced":
            stop("replaced", reason || "entered_elsewhere");
            return;
          case "stop":
            stop("refused", reason);
            return;
          case "signOut":
            signOut(reason);
            return;
        }
      };

      // `welcome` tells us the interval. Any frame proves the link is alive;
      // a whole interval with nothing back means it died without the OS
      // noticing, so drop it rather than wait for TCP to give up.
      const startHeartbeat = (seconds: number) => {
        clearInterval(heartbeat);
        if (seconds <= 0) return;
        heartbeat = setInterval(() => {
          if (ws !== next) {
            clearInterval(heartbeat);
            return;
          }
          if (awaitingReply) {
            next.onclose = null;
            next.close();
            handleClosed(ABNORMAL_CLOSURE, "");
            return;
          }
          awaitingReply = true;
          next.send(JSON.stringify({ type: "ping" }));
        }, seconds * 1000);
      };

      next.onopen = () => {
        attempt = 0;
        setConnection({ socket: next, status: "open", closeReason: null });
      };
      // addEventListener, so consumers setting onmessage can't break it.
      next.addEventListener("message", (event) => {
        awaitingReply = false;
        const message = parseServerMessage(event.data);
        if (!message) return;
        for (const listener of listeners.current) {
          try {
            listener(message);
          } catch (error) {
            // One bad subscriber mustn't stop the heartbeat or the others.
            console.error("World message listener failed:", error);
          }
        }
        // Parsing only checks `type`, so check the interval before trusting it.
        if (
          message.type === "welcome" &&
          typeof message.heartbeatSeconds === "number"
        ) {
          // Admitted: a later session_expired deserves a fresh refresh.
          refreshed = false;
          startHeartbeat(message.heartbeatSeconds);
        }
      });
      // RN fires onerror before onclose, so onclose alone drives retries.
      next.onclose = (event) => handleClosed(event.code, event.reason);
    };

    const teardown = () => {
      dial += 1;
      clearTimeout(retryTimer);
      retryTimer = undefined;
      if (!ws) return;
      const current = ws;
      // Detach first so the resulting onclose doesn't schedule a retry.
      ws = null;
      current.onopen = null;
      current.close();
    };

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "background") {
        paused = true;
        teardown();
        if (!stopped) setConnection(CONNECTING);
      } else if (state === "active" && paused) {
        paused = false;
        attempt = 0;
        if (!stopped) void connect();
      }
    });

    if (!paused) void connect();

    return () => {
      disposed = true;
      subscription.remove();
      teardown();
      setConnection(CONNECTING);
    };
  }, [status, url, origin, cohortId, generation]);

  const reconnect = React.useCallback(() => setGeneration((g) => g + 1), []);
  const enabled = status === "authenticated" && cohortId !== null;

  const current = enabled ? connection : IDLE;
  const send = React.useCallback(
    (message: ClientMessage) => {
      const socket = current.socket;
      if (!socket || socket.readyState !== WebSocket.OPEN) return false;
      socket.send(JSON.stringify(message));
      return true;
    },
    [current.socket],
  );
  const subscribe = React.useCallback((listener: ServerMessageListener) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);

  const value = React.useMemo<WebSocketState>(
    () => ({ ...current, reconnect, send, subscribe }),
    [current, reconnect, send, subscribe],
  );

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}
