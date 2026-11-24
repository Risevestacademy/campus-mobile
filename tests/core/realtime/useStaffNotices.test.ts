import { useStaffNotices } from "@core/realtime/useStaffNotices";
import type { ServerMessage } from "@shared/lib/ws";
import { useWorldStore } from "@store/world";
import { act, renderHook } from "@testing-library/react-native";

const mockListeners = new Set<(message: ServerMessage) => void>();
const mockSystem = jest.fn();

jest.mock("@shared/hooks/useWs", () => ({
  useWs: () => ({
    subscribe: (listener: (message: ServerMessage) => void) => {
      mockListeners.add(listener);
      return () => mockListeners.delete(listener);
    },
  }),
}));
jest.mock("@shared/components/atoms", () => ({
  toast: { system: (...args: unknown[]) => mockSystem(...args) },
}));

const emit = (message: unknown) =>
  act(() =>
    mockListeners.forEach((listener) => listener(message as ServerMessage)),
  );

const action = (over: Record<string, unknown>) => ({
  type: "staffAction",
  action: "muted",
  userId: "me",
  by: "staff",
  spaceKey: "hall",
  until: null,
  player: null,
  ...over,
});

describe("useStaffNotices", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockListeners.clear();
    useWorldStore.getState().reset();
    useWorldStore
      .getState()
      .apply({ type: "welcome", userId: "me" } as ServerMessage);
  });

  it("says so when staff mute you", async () => {
    await renderHook(() => useStaffNotices());
    await emit(action({}));
    expect(mockSystem).toHaveBeenCalledWith(
      expect.objectContaining({ title: "You were muted" }),
    );
  });

  it("says when you can come back after staff move you out", async () => {
    await renderHook(() => useStaffNotices());
    await emit(
      action({ action: "removed", until: "2026-11-24T10:05:00.000Z" }),
    );
    expect(mockSystem).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Moved out of the space" }),
    );
  });

  it("is quiet about what staff do to other people", async () => {
    await renderHook(() => useStaffNotices());
    await emit(action({ userId: "someone-else" }));
    expect(mockSystem).not.toHaveBeenCalled();
  });
});
