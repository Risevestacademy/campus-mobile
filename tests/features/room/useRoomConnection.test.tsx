import type { ServerMessage } from "@shared/lib/ws";
import { useWorldStore } from "@store/world";
import { act, renderHook } from "@testing-library/react-native";

import { useRoomConnection } from "../../../src/feature/room/hooks/useRoomConnection";

const mockSend = jest.fn(() => true);
const mockListeners = new Set<(message: unknown) => void>();
const mockCtx = {
  call: null as null | { url: string; room: string; token: string },
  inSync: false,
  joinBy: null as number | null,
  nearbyUserIds: [] as string[],
  refresh: jest.fn(),
};

jest.mock("@shared/hooks/useWs", () => ({
  useWs: () => ({
    send: mockSend,
    subscribe: (listener: (message: unknown) => void) => {
      mockListeners.add(listener);
      return () => mockListeners.delete(listener);
    },
  }),
}));

jest.mock("../../../src/feature/room/providers/SpaceCallProvider", () => ({
  useSpaceCallContext: () => mockCtx,
}));

const apply = (message: unknown) =>
  useWorldStore.getState().apply(message as ServerMessage);

function standIn(spaceKey: string, mode = "avatar") {
  apply({ type: "welcome", userId: "me", mode });
  apply({
    type: "snapshot",
    players: [
      {
        userId: "me",
        x: 0,
        y: 0,
        facing: "down",
        displayName: "Me",
        spriteKey: null,
        status: "available",
        statusUntil: null,
        spaceKey,
      },
    ],
    spaces: [],
  });
}

function callFor(room: string, token = `${room}-token`) {
  mockCtx.call = { url: "wss://media.example", room, token };
  mockCtx.inSync = true;
  mockCtx.joinBy = Date.now() + 10 * 60_000;
}

describe("useRoomConnection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockListeners.clear();
    useWorldStore.getState().reset();
    mockCtx.call = null;
    mockCtx.inSync = false;
    mockCtx.joinBy = null;
  });

  it("walks you there and won't join the call of the space you're leaving", async () => {
    standIn("library");
    callFor("library");

    const { result } = await renderHook(() => useRoomConnection("studio"));

    expect(mockSend).toHaveBeenCalledWith({
      type: "goToSpace",
      spaceKey: "studio",
    });
    expect(result.current.phase).toBe("walking");
    expect(result.current.connect).toBe(false);
  });

  it("waits for this space's call once you arrive", async () => {
    standIn("studio");
    callFor("library");
    mockCtx.inSync = false;

    const { result } = await renderHook(() => useRoomConnection("studio"));

    expect(result.current.phase).toBe("waiting");
    expect(result.current.connect).toBe(false);
  });

  it("joins once you're there and the call is this space's", async () => {
    standIn("studio");
    callFor("studio");

    const { result } = await renderHook(() => useRoomConnection("studio"));

    expect(mockSend).not.toHaveBeenCalled();
    expect(result.current.phase).toBe("joining");
    expect(result.current.connect).toBe(true);
  });

  it("says when the walk there was turned away", async () => {
    standIn("library");
    const { result } = await renderHook(() => useRoomConnection("studio"));

    await act(() =>
      mockListeners.forEach((listener) =>
        listener({
          type: "walkEnded",
          toSpaceKey: "studio",
          reason: "refused",
        }),
      ),
    );

    expect(result.current.phase).toBe("stuck");
    expect(result.current.stuckReason).toBe("refused");
  });

  it("stays out while another device stands for you", async () => {
    standIn("studio", "watcher");
    callFor("studio");

    const { result } = await renderHook(() => useRoomConnection("studio"));

    expect(result.current.phase).toBe("watching");
    expect(result.current.connect).toBe(false);
  });

  it("tells a failed join from a call lost after joining, and retries both", async () => {
    standIn("studio");
    callFor("studio");
    const { result } = await renderHook(() => useRoomConnection("studio"));

    await act(() => result.current.onDisconnected());
    expect(result.current.phase).toBe("failed");

    await act(() => result.current.retry());
    expect(result.current.phase).toBe("joining");
    const secondTry = result.current.roomKey;

    await act(() => result.current.onConnected());
    expect(result.current.phase).toBe("connected");

    await act(() => result.current.onDisconnected());
    expect(result.current.phase).toBe("dropped");
    expect(result.current.connect).toBe(false);

    await act(() => result.current.retry());
    expect(result.current.phase).toBe("joining");
    expect(result.current.roomKey).not.toBe(secondTry);
  });

  it("gets fresh credentials instead of joining with an expired token", async () => {
    jest.useFakeTimers();
    standIn("studio");
    callFor("studio");
    mockCtx.joinBy = Date.now() - 1;

    const { result } = await renderHook(() => useRoomConnection("studio"));
    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });

    expect(result.current.phase).toBe("refreshing");
    expect(result.current.connect).toBe(false);
    expect(mockCtx.refresh).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });
});
