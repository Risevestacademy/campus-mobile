import type { ServerMessage } from "@shared/lib/ws";
import { useWorldStore } from "@store/world";
import { act, renderHook } from "@testing-library/react-native";

import { useRoomConnection } from "../../../src/feature/room/hooks/useRoomConnection";

const mockSend = jest.fn(() => true);
const mockListeners = new Set<(message: unknown) => void>();
const mockClose = jest.fn();
const mockHost = {
  phase: "idle" as string,
  retry: jest.fn(),
  open: jest.fn(() => mockClose),
};
const mockCtx = { inSync: false };
const mockBack = jest.fn();
const mockToastError = jest.fn();

jest.mock("expo-router", () => ({ useRouter: () => ({ back: mockBack }) }));
jest.mock("@shared/components/atoms", () => ({
  toast: { error: (...args: unknown[]) => mockToastError(...args) },
}));

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

jest.mock("../../../src/feature/room/providers/SpaceRoomHost", () => ({
  useSpaceRoomContext: () => mockHost,
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

describe("useRoomConnection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockListeners.clear();
    useWorldStore.getState().reset();
    mockHost.phase = "idle";
    mockCtx.inSync = false;
  });

  it("walks you there, and doesn't ask to join the space you're leaving", async () => {
    standIn("library");

    const { result } = await renderHook(() => useRoomConnection("studio"));

    expect(mockSend).toHaveBeenCalledWith({
      type: "goToSpace",
      spaceKey: "studio",
    });
    expect(result.current.phase).toBe("walking");
    expect(mockHost.open).not.toHaveBeenCalled();
  });

  it("asks the app-wide call to join once you're in the space", async () => {
    standIn("studio");
    mockCtx.inSync = true;
    mockHost.phase = "connecting";

    const { result, unmount } = await renderHook(() =>
      useRoomConnection("studio"),
    );

    expect(mockSend).not.toHaveBeenCalled();
    expect(mockHost.open).toHaveBeenCalledTimes(1);
    expect(result.current.phase).toBe("joining");

    // Closing the screen lets the call go back to listening only for nearby.
    await unmount();
    expect(mockClose).toHaveBeenCalled();
  });

  it("waits for this space's call once you arrive", async () => {
    standIn("studio");

    const { result } = await renderHook(() => useRoomConnection("studio"));

    expect(result.current.phase).toBe("waiting");
  });

  it.each(["connected", "failed", "dropped", "refreshing"])(
    "shows the call's %s phase",
    async (phase) => {
      standIn("studio");
      mockCtx.inSync = true;
      mockHost.phase = phase;

      const { result } = await renderHook(() => useRoomConnection("studio"));

      expect(result.current.phase).toBe(phase);
    },
  );

  it("says when the walk there was turned away", async () => {
    standIn("library");
    const { result } = await renderHook(() => useRoomConnection("studio"));

    await act(() =>
      mockListeners.forEach((listener) =>
        listener({ type: "walkEnded", toSpaceKey: "studio", reason: "full" }),
      ),
    );

    expect(result.current.phase).toBe("stuck");
    expect(result.current.stuckReason).toBe("full");
  });

  it("goes back, saying why, when world refuses the walk itself", async () => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
    standIn("library");
    await renderHook(() => useRoomConnection("nowhere"));

    await act(() =>
      mockListeners.forEach((listener) =>
        listener({ type: "error", code: "NOT_ALLOWED", message: "no space" }),
      ),
    );

    expect(mockToastError).toHaveBeenCalledWith(
      expect.any(String),
      "Can't get there",
    );
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("ignores an error once the walk has begun", async () => {
    standIn("library");
    await renderHook(() => useRoomConnection("studio"));

    await act(() =>
      mockListeners.forEach((listener) => {
        listener({ type: "walking", toSpaceKey: "studio" });
        listener({ type: "error", code: "NOT_ALLOWED", message: "say limit" });
      }),
    );

    expect(mockBack).not.toHaveBeenCalled();
  });

  it("ignores an error when it asked for no walk", async () => {
    standIn("studio");
    await renderHook(() => useRoomConnection("studio"));

    await act(() =>
      mockListeners.forEach((listener) =>
        listener({ type: "error", code: "NOT_ALLOWED", message: "other" }),
      ),
    );

    expect(mockBack).not.toHaveBeenCalled();
  });

  it("stays out while another device stands for you", async () => {
    standIn("studio", "watcher");
    mockCtx.inSync = true;

    const { result } = await renderHook(() => useRoomConnection("studio"));

    expect(result.current.phase).toBe("watching");
    expect(mockHost.open).not.toHaveBeenCalled();
  });
});
