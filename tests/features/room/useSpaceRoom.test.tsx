import type { ServerMessage } from "@shared/lib/ws";
import { useWorldStore } from "@store/world";
import { act, renderHook } from "@testing-library/react-native";
import { Room, RoomEvent } from "livekit-client";

import { useSpaceRoom } from "../../../src/feature/room/hooks/useSpaceRoom";

type MockRoom = Room & {
  connect: jest.Mock;
  disconnect: jest.Mock;
  emit: (event: string) => void;
};

const mockCtx = {
  call: null as null | {
    url: string;
    room: string;
    token: string;
    hearing: "room" | "proximity";
  },
  inSync: false,
  heard: false,
  joinBy: null as number | null,
  nearbyUserIds: [] as string[],
  refresh: jest.fn(),
};

jest.mock("../../../src/feature/room/providers/SpaceCallProvider", () => ({
  useSpaceCallContext: () => mockCtx,
}));

function callIn(hearing: "room" | "proximity", token = "token-1") {
  mockCtx.call = {
    url: "wss://media.example",
    room: "library",
    token,
    hearing,
  };
  mockCtx.inSync = true;
  mockCtx.joinBy = Date.now() + 10 * 60_000;
}

/** Lets the connect promise settle. */
const settle = () => act(async () => {});

describe("useSpaceRoom", () => {
  let room: MockRoom;

  beforeEach(() => {
    jest.clearAllMocks();
    room = new Room() as MockRoom;
    useWorldStore.getState().reset();
    useWorldStore.getState().apply({
      type: "welcome",
      userId: "me",
      mode: "avatar",
    } as ServerMessage);
    mockCtx.call = null;
    mockCtx.inSync = false;
    mockCtx.heard = false;
    mockCtx.joinBy = null;
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("waits in a proximity space until somebody is in earshot", async () => {
    callIn("proximity");

    const { result } = await renderHook(() => useSpaceRoom(room));

    expect(result.current.phase).toBe("idle");
    expect(room.connect).not.toHaveBeenCalled();
  });

  it("starts listening the moment nearby names somebody, without opening the space", async () => {
    callIn("proximity");
    const { result, rerender } = await renderHook(() => useSpaceRoom(room));

    mockCtx.heard = true;
    await rerender({});
    await settle();

    expect(room.connect).toHaveBeenCalledWith(
      "wss://media.example",
      "token-1",
      { autoSubscribe: false },
    );
    expect(result.current.phase).toBe("connected");
  });

  it("listens straight away in a whole-room space", async () => {
    callIn("room");

    await renderHook(() => useSpaceRoom(room));

    expect(room.connect).toHaveBeenCalledWith(
      "wss://media.example",
      "token-1",
      { autoSubscribe: true },
    );
  });

  it("joins once, however often it re-renders", async () => {
    callIn("room");
    const { rerender } = await renderHook(() => useSpaceRoom(room));
    await settle();

    // nearby frames, store updates…
    await rerender({});
    await rerender({});

    expect(room.connect).toHaveBeenCalledTimes(1);
    expect(room.disconnect).not.toHaveBeenCalled();
  });

  it("joins when a space screen is open, even with nobody in earshot", async () => {
    callIn("proximity");
    const { result } = await renderHook(() => useSpaceRoom(room));

    let close = () => {};
    await act(() => {
      close = result.current.open();
    });
    expect(room.connect).toHaveBeenCalledTimes(1);

    await act(() => close());
    expect(room.disconnect).toHaveBeenCalled();
  });

  it("leaves for the next space's call and joins that one", async () => {
    callIn("room");
    const { rerender } = await renderHook(() => useSpaceRoom(room));

    callIn("room", "token-2");
    await rerender({});

    expect(room.disconnect).toHaveBeenCalledTimes(1);
    expect(room.connect).toHaveBeenLastCalledWith(
      "wss://media.example",
      "token-2",
      { autoSubscribe: true },
    );
  });

  it("stays out while another device stands for you", async () => {
    callIn("room");
    useWorldStore.getState().apply({ type: "watching" } as ServerMessage);

    const { result } = await renderHook(() => useSpaceRoom(room));

    expect(result.current.phase).toBe("idle");
    expect(room.connect).not.toHaveBeenCalled();
  });

  it("tells a failed join from a lost call, and retries", async () => {
    callIn("room");
    room.connect.mockRejectedValueOnce(new Error("could not establish"));
    const { result } = await renderHook(() => useSpaceRoom(room));
    await settle();
    expect(result.current.phase).toBe("failed");

    await act(() => result.current.retry());
    await settle();
    expect(room.connect).toHaveBeenCalledTimes(2);
    expect(result.current.phase).toBe("connected");

    // LiveKit gave up reconnecting.
    await act(() => room.emit(RoomEvent.Disconnected));
    expect(result.current.phase).toBe("dropped");
  });

  it("gets fresh credentials instead of joining with an expired token", async () => {
    jest.useFakeTimers();
    callIn("room");
    mockCtx.joinBy = Date.now() - 1;

    const { result } = await renderHook(() => useSpaceRoom(room));
    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });

    expect(room.connect).not.toHaveBeenCalled();
    expect(result.current.phase).toBe("refreshing");
    expect(mockCtx.refresh).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });
});
