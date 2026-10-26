import {
  INITIAL_RETRY_DELAY_MS,
  MAX_RETRY_DELAY_MS,
  WebSocketProvider,
} from "@shared/components/providers/ws";
import { useWs, useWsMessage } from "@shared/hooks/useWs";
import type { ServerMessageOf, WebSocketState } from "@shared/lib/ws";
import { useSessionStore } from "@store/session";
import { act, render } from "@testing-library/react-native";
import React from "react";
import { AppState, type AppStateStatus } from "react-native";

jest.mock("@core/auth/tokenStorage", () => ({
  getAuthTokens: jest.fn(),
  clearAuthTokens: jest.fn().mockResolvedValue(undefined),
  isRefreshTokenExpired: jest.fn().mockResolvedValue(false),
  getHasInvite: jest.fn().mockResolvedValue(false),
  setHasInvite: jest.fn().mockResolvedValue(undefined),
}));

const WS_URL = "wss://api.example.com/ws";
const COHORT_ID = "cohort-1";
const SOCKET_URL = `${WS_URL}?cohortId=${COHORT_ID}`;

type CloseEventLike = { code: number; reason: string };

class MockWebSocket {
  static readonly OPEN = 1;
  static instances: MockWebSocket[] = [];
  static throwOnNext: Error | null = null;

  readyState = 0;
  onopen: (() => void) | null = null;
  onclose: ((event: CloseEventLike) => void) | null = null;
  close = jest.fn(() => this.onclose?.({ code: 1000, reason: "" }));
  send = jest.fn();
  private messageListeners: ((event: { data: unknown }) => void)[] = [];

  constructor(
    public url: string,
    public protocols: unknown,
    public options: { headers?: Record<string, string> },
  ) {
    const error = MockWebSocket.throwOnNext;
    if (error) {
      MockWebSocket.throwOnNext = null;
      throw error;
    }
    MockWebSocket.instances.push(this);
  }

  addEventListener(type: string, listener: (event: { data: unknown }) => void) {
    if (type === "message") this.messageListeners.push(listener);
  }

  open() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.();
  }

  /** Server-side or network close; 1006 is a dropped connection. */
  serverClose(code = 1006, reason = "") {
    this.onclose?.({ code, reason });
  }

  receive(frame: object) {
    const event = { data: JSON.stringify(frame) };
    this.messageListeners.forEach((listener) => listener(event));
  }
}

const getAccessToken = jest.fn<Promise<string | null>, []>();
const originalWebSocket = global.WebSocket;

const onState = jest.fn<void, [WebSocketState]>();
const refreshSession = jest.fn<Promise<boolean>, []>();

function Consumer() {
  onState(useWs());
  return null;
}

function currentState() {
  const state = onState.mock.calls.at(-1)?.[0];
  if (!state) throw new Error("Consumer never rendered");
  return state;
}

function currentSocket() {
  return currentState().socket;
}

function providerElement({
  url = WS_URL,
  cohortId = COHORT_ID,
  origin,
}: { url?: string; cohortId?: string | null; origin?: string } = {}) {
  return (
    <WebSocketProvider
      url={url}
      cohortId={cohortId}
      origin={origin}
      getAccessToken={getAccessToken}
      refreshSession={refreshSession}
    >
      <Consumer />
    </WebSocketProvider>
  );
}

async function renderProvider(props?: Parameters<typeof providerElement>[0]) {
  return await render(providerElement(props));
}

function lastSocket() {
  const socket = MockWebSocket.instances.at(-1);
  if (!socket) throw new Error("No WebSocket was created");
  return socket;
}

describe("WebSocketProvider", () => {
  beforeAll(() => {
    global.WebSocket = MockWebSocket as unknown as typeof WebSocket;
  });

  afterAll(() => {
    global.WebSocket = originalWebSocket;
  });

  beforeEach(() => {
    MockWebSocket.instances = [];
    getAccessToken.mockResolvedValue("abc123");
    useSessionStore.setState({ status: "authenticated", hasInvite: false });
  });

  it("does not connect while the session is not authenticated", async () => {
    useSessionStore.setState({ status: "unauthenticated" });

    await renderProvider();

    expect(MockWebSocket.instances).toHaveLength(0);
    expect(currentSocket()).toBeNull();
  });

  it("stays idle without a cohort", async () => {
    await renderProvider({ cohortId: null });

    expect(MockWebSocket.instances).toHaveLength(0);
    expect(currentState().status).toBe("idle");
  });

  it("reports idle while signed out and connecting while dialing", async () => {
    useSessionStore.setState({ status: "unauthenticated" });
    const { rerender } = await renderProvider();
    expect(currentState().status).toBe("idle");

    await act(() => useSessionStore.setState({ status: "authenticated" }));
    await rerender(providerElement());
    expect(currentState().status).toBe("connecting");

    await act(() => lastSocket().open());
    expect(currentState().status).toBe("open");
  });

  it("does not connect when there is no access token", async () => {
    getAccessToken.mockResolvedValue(null);

    await renderProvider();

    expect(MockWebSocket.instances).toHaveLength(0);
    expect(currentSocket()).toBeNull();
  });

  it("connects with the access token as a bearer header", async () => {
    await renderProvider();

    const socket = lastSocket();
    expect(socket.url).toBe(SOCKET_URL);
    expect(socket.options.headers).toEqual({
      Authorization: "Bearer abc123",
    });
  });

  it("sends the configured origin", async () => {
    await renderProvider({ origin: "https://dev.example.com" });

    expect(lastSocket().options.headers).toEqual({
      Authorization: "Bearer abc123",
      Origin: "https://dev.example.com",
    });
  });

  it("exposes the socket only once it is open", async () => {
    await renderProvider();

    expect(currentSocket()).toBeNull();

    await act(() => lastSocket().open());

    expect(currentSocket()).toBe(lastSocket());
  });

  it("resets to null when the server closes the socket", async () => {
    await renderProvider();
    await act(() => lastSocket().open());

    await act(() => lastSocket().serverClose());

    expect(currentSocket()).toBeNull();
  });

  it("closes the socket when the session ends", async () => {
    await renderProvider();
    const socket = lastSocket();
    await act(() => socket.open());

    await act(() => useSessionStore.setState({ status: "unauthenticated" }));

    expect(socket.close).toHaveBeenCalledTimes(1);
    expect(currentSocket()).toBeNull();
  });

  it("closes the socket on unmount", async () => {
    const { unmount } = await renderProvider();
    const socket = lastSocket();

    await unmount();

    expect(socket.close).toHaveBeenCalledTimes(1);
  });

  it("drops a token that arrives after the session ended", async () => {
    let resolveToken!: (token: string) => void;
    getAccessToken.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveToken = resolve;
      }),
    );
    await renderProvider();

    await act(() => useSessionStore.setState({ status: "unauthenticated" }));
    await act(async () => resolveToken("late"));

    expect(MockWebSocket.instances).toHaveLength(0);
  });

  it("ignores a late open from a socket that was already torn down", async () => {
    const { rerender } = await renderProvider();
    const stale = lastSocket();

    await rerender(providerElement({ url: "wss://other.example.com/ws" }));
    await act(() => stale.open());

    expect(currentSocket()).toBeNull();
    expect(MockWebSocket.instances).toHaveLength(2);
  });
});

describe("WebSocketProvider reconnection", () => {
  beforeAll(() => {
    global.WebSocket = MockWebSocket as unknown as typeof WebSocket;
  });

  afterAll(() => {
    global.WebSocket = originalWebSocket;
  });

  beforeEach(() => {
    jest.useFakeTimers();
    // Max jitter, so each retry waits the full backoff delay.
    jest.spyOn(Math, "random").mockReturnValue(1);
    MockWebSocket.instances = [];
    getAccessToken.mockResolvedValue("abc123");
    useSessionStore.setState({ status: "authenticated", hasInvite: false });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  async function advance(ms: number) {
    await act(async () => {
      jest.advanceTimersByTime(ms);
    });
  }

  it("keeps checking for the token until it appears", async () => {
    getAccessToken.mockResolvedValue(null);
    await renderProvider();
    expect(MockWebSocket.instances).toHaveLength(0);

    await advance(INITIAL_RETRY_DELAY_MS);
    expect(getAccessToken).toHaveBeenCalledTimes(2);
    expect(MockWebSocket.instances).toHaveLength(0);

    getAccessToken.mockResolvedValue("late");
    await advance(INITIAL_RETRY_DELAY_MS * 2);

    expect(lastSocket().options.headers).toEqual({
      Authorization: "Bearer late",
    });
  });

  it("reconnects with exponential backoff after the socket closes", async () => {
    await renderProvider();
    await act(() => lastSocket().open());

    await act(() => lastSocket().serverClose());
    expect(currentSocket()).toBeNull();

    await advance(INITIAL_RETRY_DELAY_MS - 1);
    expect(MockWebSocket.instances).toHaveLength(1);
    await advance(1);
    expect(MockWebSocket.instances).toHaveLength(2);

    // Fails before opening: next wait doubles.
    await act(() => lastSocket().serverClose());
    await advance(INITIAL_RETRY_DELAY_MS * 2 - 1);
    expect(MockWebSocket.instances).toHaveLength(2);
    await advance(1);
    expect(MockWebSocket.instances).toHaveLength(3);

    await act(() => lastSocket().open());
    expect(currentSocket()).toBe(lastSocket());
  });

  it("resets the backoff once a connection opens", async () => {
    await renderProvider();
    await act(() => lastSocket().serverClose());
    await advance(INITIAL_RETRY_DELAY_MS);
    await act(() => lastSocket().serverClose());
    await advance(INITIAL_RETRY_DELAY_MS * 2);

    await act(() => lastSocket().open());
    await act(() => lastSocket().serverClose());
    await advance(INITIAL_RETRY_DELAY_MS);

    expect(MockWebSocket.instances).toHaveLength(4);
  });

  it.each([
    [
      "the token lookup",
      () => {
        getAccessToken.mockRejectedValueOnce(new Error("storage unavailable"));
      },
    ],
    [
      "opening the socket",
      () => {
        MockWebSocket.throwOnNext = new Error("SyntaxError");
      },
    ],
  ])("retries instead of crashing when %s throws", async (_, failNext) => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    failNext();

    await renderProvider();
    expect(currentState().status).toBe("connecting");
    expect(consoleError).toHaveBeenCalledWith(
      "Failed to open world socket:",
      expect.any(Error),
    );

    await advance(INITIAL_RETRY_DELAY_MS);
    await act(() => lastSocket().open());
    expect(currentState().status).toBe("open");
  });

  it("survives a throw inside a retry timer", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    getAccessToken
      .mockResolvedValueOnce(null)
      .mockRejectedValueOnce(new Error("native storage error"));

    await renderProvider();
    await advance(INITIAL_RETRY_DELAY_MS);
    await advance(INITIAL_RETRY_DELAY_MS * 2);

    expect(MockWebSocket.instances).toHaveLength(1);
  });

  it("caps the backoff delay", async () => {
    getAccessToken.mockResolvedValue(null);
    await renderProvider();

    for (let i = 0; i < 10; i++) {
      await advance(MAX_RETRY_DELAY_MS);
    }
    getAccessToken.mockClear();

    await advance(MAX_RETRY_DELAY_MS);
    expect(getAccessToken).toHaveBeenCalledTimes(1);
  });

  it("stops retrying after logout", async () => {
    getAccessToken.mockResolvedValue(null);
    await renderProvider();

    await act(() => useSessionStore.setState({ status: "unauthenticated" }));
    getAccessToken.mockClear();
    await advance(MAX_RETRY_DELAY_MS * 2);

    expect(getAccessToken).not.toHaveBeenCalled();
  });

  it("does not reconnect a socket closed by logout or unmount", async () => {
    const { unmount } = await renderProvider();
    await act(() => lastSocket().open());

    await unmount();
    await advance(MAX_RETRY_DELAY_MS * 2);

    expect(MockWebSocket.instances).toHaveLength(1);
  });
});

describe("WebSocketProvider app state", () => {
  let emitAppState: (state: AppStateStatus) => void;
  const removeSubscription = jest.fn();
  // jest's AppState mock doesn't model currentState as a plain string.
  const appState = AppState as { currentState: unknown };
  const originalCurrentState = appState.currentState;

  beforeAll(() => {
    global.WebSocket = MockWebSocket as unknown as typeof WebSocket;
  });

  afterAll(() => {
    global.WebSocket = originalWebSocket;
  });

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(Math, "random").mockReturnValue(1);
    appState.currentState = "active";
    jest
      .spyOn(AppState, "addEventListener")
      .mockImplementation((_type, handler) => {
        emitAppState = handler;
        return { remove: removeSubscription };
      });
    MockWebSocket.instances = [];
    getAccessToken.mockResolvedValue("abc123");
    useSessionStore.setState({ status: "authenticated", hasInvite: false });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    appState.currentState = originalCurrentState;
  });

  async function setAppState(state: AppStateStatus) {
    await act(async () => emitAppState(state));
  }

  it("closes the socket when the app goes to the background", async () => {
    await renderProvider();
    const socket = lastSocket();
    await act(() => socket.open());

    await setAppState("background");

    expect(socket.close).toHaveBeenCalledTimes(1);
    expect(currentSocket()).toBeNull();
  });

  it("does not retry while in the background", async () => {
    getAccessToken.mockResolvedValue(null);
    await renderProvider();

    await setAppState("background");
    getAccessToken.mockClear();
    await act(async () => {
      jest.advanceTimersByTime(MAX_RETRY_DELAY_MS * 2);
    });

    expect(getAccessToken).not.toHaveBeenCalled();
  });

  it("reconnects immediately when the app becomes active again", async () => {
    await renderProvider();
    await act(() => lastSocket().open());

    await setAppState("background");
    await setAppState("active");

    expect(MockWebSocket.instances).toHaveLength(2);
    await act(() => lastSocket().open());
    expect(currentSocket()).toBe(lastSocket());
  });

  it("resets the backoff when returning to the foreground", async () => {
    await renderProvider();
    // Build up backoff: two failed attempts, next wait would be 4s.
    await act(() => lastSocket().serverClose());
    await act(async () => {
      jest.advanceTimersByTime(INITIAL_RETRY_DELAY_MS);
    });
    await act(() => lastSocket().serverClose());

    await setAppState("background");
    await setAppState("active");
    await act(() => lastSocket().serverClose());
    await act(async () => {
      jest.advanceTimersByTime(INITIAL_RETRY_DELAY_MS);
    });

    expect(MockWebSocket.instances).toHaveLength(4);
  });

  it("ignores the transient inactive state", async () => {
    await renderProvider();
    const socket = lastSocket();
    await act(() => socket.open());

    await setAppState("inactive");
    await setAppState("active");

    expect(socket.close).not.toHaveBeenCalled();
    expect(MockWebSocket.instances).toHaveLength(1);
  });

  it("waits for the foreground when launched in the background", async () => {
    appState.currentState = "background";
    await renderProvider();
    expect(MockWebSocket.instances).toHaveLength(0);

    await setAppState("active");

    expect(MockWebSocket.instances).toHaveLength(1);
  });

  it("removes the AppState listener on unmount", async () => {
    const { unmount } = await renderProvider();

    await unmount();

    expect(removeSubscription).toHaveBeenCalledTimes(1);
  });
});

describe("WebSocketProvider heartbeat", () => {
  const HEARTBEAT_SECONDS = 20;
  const HEARTBEAT_MS = HEARTBEAT_SECONDS * 1000;
  const PING = JSON.stringify({ type: "ping" });

  beforeAll(() => {
    global.WebSocket = MockWebSocket as unknown as typeof WebSocket;
  });

  afterAll(() => {
    global.WebSocket = originalWebSocket;
  });

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(Math, "random").mockReturnValue(1);
    MockWebSocket.instances = [];
    getAccessToken.mockResolvedValue("abc123");
    useSessionStore.setState({ status: "authenticated", hasInvite: false });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  async function advance(ms: number) {
    await act(async () => {
      jest.advanceTimersByTime(ms);
    });
  }

  async function connectAndWelcome(heartbeatSeconds = HEARTBEAT_SECONDS) {
    await renderProvider();
    const socket = lastSocket();
    await act(() => socket.open());
    await act(() => socket.receive({ type: "welcome", heartbeatSeconds }));
    return socket;
  }

  it("does not ping before the welcome frame", async () => {
    await renderProvider();
    await act(() => lastSocket().open());

    await advance(HEARTBEAT_MS * 3);

    expect(lastSocket().send).not.toHaveBeenCalled();
  });

  it("pings every heartbeatSeconds after welcome", async () => {
    const socket = await connectAndWelcome();

    await advance(HEARTBEAT_MS);
    expect(socket.send).toHaveBeenCalledWith(PING);

    await act(() => socket.receive({ type: "pong" }));
    await advance(HEARTBEAT_MS);
    expect(socket.send).toHaveBeenCalledTimes(2);
  });

  it("drops the socket and reconnects when a ping goes unanswered", async () => {
    const socket = await connectAndWelcome();

    await advance(HEARTBEAT_MS);
    await advance(HEARTBEAT_MS);

    expect(socket.close).toHaveBeenCalledTimes(1);
    expect(currentSocket()).toBeNull();

    await advance(INITIAL_RETRY_DELAY_MS);
    expect(MockWebSocket.instances).toHaveLength(2);
  });

  it("treats any frame as proof the link is alive", async () => {
    const socket = await connectAndWelcome();

    await advance(HEARTBEAT_MS);
    await act(() => socket.receive({ type: "moved", players: [] }));
    await advance(HEARTBEAT_MS);

    expect(socket.close).not.toHaveBeenCalled();
    expect(socket.send).toHaveBeenCalledTimes(2);
  });

  it("skips the heartbeat when the server disables it", async () => {
    const socket = await connectAndWelcome(0);

    await advance(MAX_RETRY_DELAY_MS * 2);

    expect(socket.send).not.toHaveBeenCalled();
  });

  it("stops pinging once the socket closes", async () => {
    const socket = await connectAndWelcome();

    await act(() => useSessionStore.setState({ status: "unauthenticated" }));
    await advance(HEARTBEAT_MS * 3);

    expect(socket.send).not.toHaveBeenCalled();
  });
});

describe("WebSocketProvider close codes", () => {
  const clearSession = jest.fn().mockResolvedValue(undefined);

  beforeAll(() => {
    global.WebSocket = MockWebSocket as unknown as typeof WebSocket;
  });

  afterAll(() => {
    global.WebSocket = originalWebSocket;
  });

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(Math, "random").mockReturnValue(1);
    MockWebSocket.instances = [];
    getAccessToken.mockResolvedValue("abc123");
    refreshSession.mockResolvedValue(true);
    useSessionStore.setState({
      status: "authenticated",
      hasInvite: false,
      clearSession,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  async function advance(ms: number) {
    await act(async () => {
      jest.advanceTimersByTime(ms);
    });
  }

  async function openSocket() {
    await renderProvider();
    const socket = lastSocket();
    await act(() => socket.open());
    return socket;
  }

  it.each([
    [1001, "server shutting down"],
    [1011, "internal_error"],
    [1006, ""],
    [1009, ""],
    [1008, "rate_limited"],
  ])("reconnects with backoff after %i %s", async (code, reason) => {
    await openSocket();

    await act(() => lastSocket().serverClose(code, reason));
    expect(currentState().status).toBe("connecting");

    await advance(INITIAL_RETRY_DELAY_MS);
    expect(MockWebSocket.instances).toHaveLength(2);
  });

  it("stops and reports replaced on 4000 entered_elsewhere", async () => {
    await openSocket();

    await act(() => lastSocket().serverClose(4000, "entered_elsewhere"));
    await advance(MAX_RETRY_DELAY_MS * 2);

    expect(MockWebSocket.instances).toHaveLength(1);
    expect(currentState()).toMatchObject({
      socket: null,
      status: "replaced",
      closeReason: "entered_elsewhere",
    });
  });

  it("does not auto-reconnect a replaced socket on returning to the foreground", async () => {
    let emitAppState: (state: string) => void = () => {};
    jest
      .spyOn(AppState, "addEventListener")
      .mockImplementation((_type, handler) => {
        emitAppState = handler as (state: string) => void;
        return { remove: jest.fn() };
      });
    await openSocket();
    await act(() => lastSocket().serverClose(4000, "entered_elsewhere"));

    await act(async () => emitAppState("background"));
    await act(async () => emitAppState("active"));

    expect(MockWebSocket.instances).toHaveLength(1);
    expect(currentState().status).toBe("replaced");
  });

  it("reconnects when asked after being replaced", async () => {
    await openSocket();
    await act(() => lastSocket().serverClose(4000, "entered_elsewhere"));

    await act(() => currentState().reconnect());

    expect(MockWebSocket.instances).toHaveLength(2);
    expect(currentState().status).toBe("connecting");
  });

  it.each(["not_a_member", "wrong_scope", "no_cohort", "origin_not_allowed"])(
    "stops and reports refused on 1008 %s",
    async (reason) => {
      await openSocket();

      await act(() => lastSocket().serverClose(1008, reason));
      await advance(MAX_RETRY_DELAY_MS * 2);

      expect(MockWebSocket.instances).toHaveLength(1);
      expect(currentState()).toMatchObject({
        status: "refused",
        closeReason: reason,
      });
      expect(clearSession).not.toHaveBeenCalled();
    },
  );

  it("treats an unknown 1008 reason as a refusal", async () => {
    await openSocket();

    await act(() => lastSocket().serverClose(1008, "something_new"));
    await advance(MAX_RETRY_DELAY_MS * 2);

    expect(MockWebSocket.instances).toHaveLength(1);
    expect(currentState().status).toBe("refused");
  });

  it.each(["no_token", "session_revoked", "account_suspended", "account_gone"])(
    "signs out on 1008 %s",
    async (reason) => {
      await openSocket();

      await act(() => lastSocket().serverClose(1008, reason));
      await advance(MAX_RETRY_DELAY_MS * 2);

      expect(clearSession).toHaveBeenCalledWith(reason);
      expect(refreshSession).not.toHaveBeenCalled();
      expect(MockWebSocket.instances).toHaveLength(1);
    },
  );

  it.each(["token_not_usable", "session_expired", "session_ended"])(
    "refreshes and reconnects at once on 1008 %s",
    async (reason) => {
      await openSocket();
      getAccessToken.mockResolvedValue("refreshed");

      await act(() => lastSocket().serverClose(1008, reason));

      expect(refreshSession).toHaveBeenCalledTimes(1);
      expect(MockWebSocket.instances).toHaveLength(2);
      expect(lastSocket().options.headers).toEqual({
        Authorization: "Bearer refreshed",
      });
    },
  );

  it("signs out when the server still refuses after a refresh", async () => {
    await openSocket();
    await act(() => lastSocket().serverClose(1008, "session_expired"));

    await act(() => lastSocket().serverClose(1008, "session_expired"));

    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(clearSession).toHaveBeenCalledWith("session_expired");
  });

  it("refreshes again once a later connection was admitted", async () => {
    await openSocket();
    await act(() => lastSocket().serverClose(1008, "session_expired"));
    await act(() => lastSocket().open());
    await act(() =>
      lastSocket().receive({ type: "welcome", heartbeatSeconds: 0 }),
    );

    await act(() => lastSocket().serverClose(1008, "session_expired"));

    expect(refreshSession).toHaveBeenCalledTimes(2);
    expect(clearSession).not.toHaveBeenCalled();
  });

  it("retries with backoff when the refresh fails transiently", async () => {
    refreshSession.mockResolvedValue(false);
    await openSocket();

    await act(() => lastSocket().serverClose(1008, "session_expired"));
    expect(MockWebSocket.instances).toHaveLength(1);

    await advance(INITIAL_RETRY_DELAY_MS);
    expect(MockWebSocket.instances).toHaveLength(2);
    expect(clearSession).not.toHaveBeenCalled();
  });

  it("treats a throwing refresh like a failed one", async () => {
    refreshSession.mockRejectedValue(new Error("offline"));
    await openSocket();

    await act(() => lastSocket().serverClose(1008, "session_expired"));
    await advance(INITIAL_RETRY_DELAY_MS);

    expect(MockWebSocket.instances).toHaveLength(2);
  });
});

describe("WebSocketProvider messages", () => {
  const onSnapshot = jest.fn<void, [ServerMessageOf<"snapshot">]>();

  function SnapshotListener() {
    useWsMessage("snapshot", onSnapshot);
    return null;
  }

  beforeAll(() => {
    global.WebSocket = MockWebSocket as unknown as typeof WebSocket;
  });

  afterAll(() => {
    global.WebSocket = originalWebSocket;
  });

  beforeEach(() => {
    MockWebSocket.instances = [];
    onSnapshot.mockClear();
    getAccessToken.mockResolvedValue("abc123");
    useSessionStore.setState({ status: "authenticated", hasInvite: false });
  });

  async function renderWithListener() {
    await render(
      <WebSocketProvider
        url={WS_URL}
        cohortId={COHORT_ID}
        getAccessToken={getAccessToken}
        refreshSession={refreshSession}
      >
        <Consumer />
        <SnapshotListener />
      </WebSocketProvider>,
    );
  }

  const snapshot = {
    type: "snapshot",
    map: { id: "m", version: "1", width: 1, height: 1 },
    players: [],
    lockableSpaces: [],
    lockedSpaces: [],
  } as const;

  it("delivers frames that arrive before the open re-render", async () => {
    await renderWithListener();
    const socket = lastSocket();

    // Same tick as open: no render in between.
    await act(() => {
      socket.open();
      socket.receive(snapshot);
    });

    expect(onSnapshot).toHaveBeenCalledWith(snapshot);
  });

  it("only calls a listener for its own type", async () => {
    await renderWithListener();
    await act(() => lastSocket().open());

    await act(() => lastSocket().receive({ type: "left", userId: "u1" }));

    expect(onSnapshot).not.toHaveBeenCalled();
  });

  it("keeps delivering after one listener throws", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    onSnapshot.mockImplementationOnce(() => {
      throw new Error("boom");
    });
    await renderWithListener();
    await act(() => lastSocket().open());

    await act(() => lastSocket().receive(snapshot));
    await act(() => lastSocket().receive(snapshot));

    expect(onSnapshot).toHaveBeenCalledTimes(2);
    jest.restoreAllMocks();
  });

  it("sends typed client messages once open", async () => {
    await renderWithListener();
    expect(currentState().send({ type: "active" })).toBe(false);

    await act(() => lastSocket().open());

    expect(currentState().send({ type: "say", text: "hi" })).toBe(true);
    expect(lastSocket().send).toHaveBeenCalledWith(
      JSON.stringify({ type: "say", text: "hi" }),
    );
  });
});

describe("useWs", () => {
  it("throws when used outside WebSocketProvider", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await expect(render(<Consumer />)).rejects.toThrow(
      "useWs must be used inside WebSocketProvider",
    );
    consoleError.mockRestore();
  });
});
