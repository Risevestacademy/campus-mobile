import { useAvailability } from "@core/realtime";
import type { ServerMessage } from "@shared/lib/ws";
import { useWorldStore } from "@store/world";
import { act, renderHook } from "@testing-library/react-native";

const mockListeners = new Set<(message: ServerMessage) => void>();
const mockSend = jest.fn(() => true);
const mockToastError = jest.fn();

jest.mock("@shared/hooks/useWs", () => ({
  useWs: () => ({
    send: mockSend,
    subscribe: (listener: (message: ServerMessage) => void) => {
      mockListeners.add(listener);
      return () => mockListeners.delete(listener);
    },
  }),
}));

jest.mock("@shared/components/atoms", () => ({
  toast: { error: (...args: unknown[]) => mockToastError(...args) },
}));

const emit = (message: unknown) =>
  act(() =>
    mockListeners.forEach((listener) => listener(message as ServerMessage)),
  );

const refusal = {
  type: "error",
  code: "BAD_MESSAGE",
  message: "forSeconds must be at most 43200",
};

describe("useAvailability", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "warn").mockImplementation(() => {});
    mockListeners.clear();
    useWorldStore.getState().reset();
    useWorldStore
      .getState()
      .apply({ type: "welcome", userId: "me" } as ServerMessage);
  });

  afterEach(() => jest.restoreAllMocks());

  it("says so when world refuses a status change", async () => {
    const { result } = await renderHook(() => useAvailability());

    await act(() => result.current.setStatus("busy", 50_000));
    await emit(refusal);

    expect(mockToastError).toHaveBeenCalledWith(
      expect.any(String),
      "Status not changed",
    );
  });

  it("stays quiet once world has taken the change", async () => {
    const { result } = await renderHook(() => useAvailability());

    await act(() => result.current.setStatus("busy"));
    await emit({
      type: "statusChanged",
      userId: "me",
      status: "busy",
      until: null,
    });
    await emit(refusal);

    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("ignores errors when it hasn't changed anything", async () => {
    await renderHook(() => useAvailability());

    await emit(refusal);

    expect(mockToastError).not.toHaveBeenCalled();
  });
});
