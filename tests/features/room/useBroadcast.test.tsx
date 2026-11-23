import { AudioSession } from "@livekit/react-native";
import { act, renderHook } from "@testing-library/react-native";

import { useAudioSession } from "../../../src/feature/room/hooks/useAudioSession";
import { useBroadcastCall } from "../../../src/feature/room/hooks/useBroadcastCall";
import {
  BROADCAST_RETRY_MS,
  useBroadcastConnection,
} from "../../../src/feature/room/hooks/useBroadcastConnection";

const mockListeners = new Set<(message: unknown) => void>();
const mockWs = { status: "open" as string, rejoin: jest.fn() };

jest.mock("@shared/hooks/useWs", () => ({
  useWs: () => ({
    status: mockWs.status,
    rejoin: mockWs.rejoin,
    subscribe: (listener: (message: unknown) => void) => {
      mockListeners.add(listener);
      return () => mockListeners.delete(listener);
    },
  }),
}));

const emit = (message: unknown) =>
  act(() => mockListeners.forEach((listener) => listener(message)));

function jwt(claims: object) {
  const payload = btoa(JSON.stringify(claims))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `header.${payload}.signature`;
}

const broadcast = (expSeconds = 2_000_000_000, canSpeak = false) => ({
  url: "wss://media.example",
  room: "cohort-1-broadcast",
  token: jwt({ exp: expSeconds }),
  canSpeak,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockListeners.clear();
  mockWs.status = "open";
});

describe("useBroadcastCall", () => {
  it("takes the broadcast room world sends on arrival", async () => {
    const { result } = await renderHook(() => useBroadcastCall());

    await emit({ type: "broadcast", call: broadcast() });

    expect(result.current?.room).toBe("cohort-1-broadcast");
  });

  it.each(["watching", "replaced", "welcome"])(
    "leaves the broadcast room on %s",
    async (type) => {
      const { result } = await renderHook(() => useBroadcastCall());
      await emit({ type: "broadcast", call: broadcast() });

      await emit({ type, userId: "me", mode: "avatar" });

      expect(result.current).toBeNull();
    },
  );

  it.each(["idle", "refused", "replaced"])(
    "has no room while the socket is %s",
    async (status) => {
      const { result, rerender } = await renderHook(() => useBroadcastCall());
      await emit({ type: "broadcast", call: broadcast() });

      mockWs.status = status;
      await rerender({});

      expect(result.current).toBeNull();
    },
  );
});

describe("useBroadcastConnection", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const advance = (ms: number) =>
    act(async () => {
      await jest.advanceTimersByTimeAsync(ms);
    });

  it("joins as soon as world sends the room", async () => {
    const { result } = await renderHook(() =>
      useBroadcastConnection(broadcast()),
    );

    expect(result.current.connect).toBe(true);
    expect(result.current.roomKey).toBe("cohort-1-broadcast#0");
  });

  it("keeps LiveKit's handlers the same across renders, so it doesn't reconnect", async () => {
    const call = broadcast();
    const { result, rerender } = await renderHook(() =>
      useBroadcastConnection(call),
    );
    const first = result.current;

    await rerender({});

    // LiveKit's connect effect re-runs room.connect() when onError changes.
    expect(result.current.onError).toBe(first.onError);
    expect(result.current.onConnected).toBe(first.onConnected);
    expect(result.current.onDisconnected).toBe(first.onDisconnected);
  });

  it("tries again on its own after a failure, backing off", async () => {
    const { result } = await renderHook(() =>
      useBroadcastConnection(broadcast()),
    );

    jest.spyOn(console, "warn").mockImplementation(() => {});
    await act(() => result.current.onError(new Error("could not establish")));
    expect(result.current.connect).toBe(false);

    await advance(BROADCAST_RETRY_MS[0]!);
    expect(result.current.connect).toBe(true);
    expect(result.current.roomKey).toBe("cohort-1-broadcast#1");

    // A second failure in a row waits longer.
    await act(() => result.current.onDisconnected());
    await advance(BROADCAST_RETRY_MS[0]!);
    expect(result.current.connect).toBe(false);
    await advance(BROADCAST_RETRY_MS[1]! - BROADCAST_RETRY_MS[0]!);
    expect(result.current.roomKey).toBe("cohort-1-broadcast#2");
  });

  it("gets fresh credentials once the token can't get back in", async () => {
    const { result } = await renderHook(() =>
      useBroadcastConnection(broadcast(1)),
    );

    await act(() => result.current.onDisconnected());
    await advance(BROADCAST_RETRY_MS[0]!);

    expect(mockWs.rejoin).toHaveBeenCalledTimes(1);
  });

  it("doesn't retry after leaving on purpose", async () => {
    const { result, rerender } = await renderHook(
      ({ call }: { call: ReturnType<typeof broadcast> | null }) =>
        useBroadcastConnection(call),
      { initialProps: { call: broadcast() } },
    );
    const leaving = result.current;

    await rerender({ call: null });
    await act(() => leaving.onDisconnected());
    await advance(BROADCAST_RETRY_MS[2]!);

    expect(result.current.connect).toBe(false);
    expect(mockWs.rejoin).not.toHaveBeenCalled();
  });
});

describe("useAudioSession", () => {
  it("keeps the audio session open until the last room leaves", async () => {
    const space = await renderHook(() => useAudioSession());
    const broadcastRoom = await renderHook(() => useAudioSession());

    expect(AudioSession.startAudioSession).toHaveBeenCalledTimes(1);

    // Closing the space screen mustn't silence the broadcast.
    await space.unmount();
    expect(AudioSession.stopAudioSession).not.toHaveBeenCalled();

    await broadcastRoom.unmount();
    expect(AudioSession.stopAudioSession).toHaveBeenCalledTimes(1);
  });
});
