import { useAskToJoin } from "@features/campus/hooks/useAskToJoin";
import type { ServerMessage } from "@shared/lib/ws";
import { useWorldStore } from "@store/world";
import { act, renderHook } from "@testing-library/react-native";

const mockSend = jest.fn(() => true);
const mockListeners = new Set<(message: unknown) => void>();

jest.mock("@shared/hooks/useWs", () => ({
  useWs: () => ({
    send: mockSend,
    subscribe: (listener: (message: unknown) => void) => {
      mockListeners.add(listener);
      return () => mockListeners.delete(listener);
    },
  }),
}));

const emit = (message: unknown) =>
  act(() => mockListeners.forEach((listener) => listener(message)));

/** The walk to a locked room stops at its door. */
const refusedAtDoor = (mayAsk: boolean) => ({
  type: "walkEnded",
  toSpaceKey: "pod-1",
  reason: "refused",
  mayAsk,
});

async function askAtDoor() {
  const hook = await renderHook(() => useAskToJoin("pod-1"));
  await act(() => hook.result.current.ask());
  await emit(refusedAtDoor(true));
  await emit({
    type: "entryRequested",
    requestId: "req-1",
    userId: "me",
    spaceKey: "pod-1",
  });
  return hook;
}

describe("useAskToJoin", () => {
  beforeEach(() => {
    mockSend.mockClear();
    mockListeners.clear();
    useWorldStore.getState().reset();
    useWorldStore.getState().apply({
      type: "welcome",
      userId: "me",
      mode: "avatar",
    } as ServerMessage);
  });

  it("walks to the door, then asks once it's refused there", async () => {
    const { result } = await renderHook(() => useAskToJoin("pod-1"));

    await act(() => result.current.ask());
    expect(mockSend).toHaveBeenLastCalledWith({
      type: "goToSpace",
      spaceKey: "pod-1",
    });
    expect(result.current.phase).toBe("walking");

    await emit(refusedAtDoor(true));
    expect(mockSend).toHaveBeenLastCalledWith({
      type: "requestEntry",
      spaceKey: "pod-1",
    });
  });

  it("waits for an answer once world takes the request", async () => {
    const { result } = await askAtDoor();

    expect(result.current.phase).toBe("waiting");
  });

  it("walks in when somebody lets you in", async () => {
    const { result } = await askAtDoor();
    mockSend.mockClear();

    await emit({
      type: "entryRequestEnded",
      requestId: "req-1",
      userId: "me",
      spaceKey: "pod-1",
      outcome: "admitted",
      answeredBy: "ada",
    });

    expect(result.current.phase).toBe("entering");
    expect(mockSend).toHaveBeenCalledWith({
      type: "goToSpace",
      spaceKey: "pod-1",
    });
  });

  it("says so when the answer is no", async () => {
    const { result } = await askAtDoor();

    await emit({
      type: "entryRequestEnded",
      requestId: "req-1",
      userId: "me",
      spaceKey: "pod-1",
      outcome: "declined",
      answeredBy: "ada",
    });

    expect(result.current.phase).toBe("ended");
    expect(result.current.reason).toBe(
      "They said no this time. You can ask again in 30 seconds.",
    );
  });

  it("doesn't ask when nobody inside can answer", async () => {
    const { result } = await renderHook(() => useAskToJoin("pod-1"));
    await act(() => result.current.ask());

    await emit(refusedAtDoor(false));

    expect(mockSend).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: "requestEntry" }),
    );
    expect(result.current.reason).toBe(
      "Nobody inside can let you in right now.",
    );
  });

  it("withdraws the request it made", async () => {
    const { result } = await askAtDoor();

    await act(() => result.current.withdraw());

    expect(mockSend).toHaveBeenLastCalledWith({
      type: "withdrawEntryRequest",
      requestId: "req-1",
    });
  });

  it("ignores somebody else's request", async () => {
    const { result } = await renderHook(() => useAskToJoin("pod-1"));
    await act(() => result.current.ask());
    await emit(refusedAtDoor(true));

    await emit({
      type: "entryRequested",
      requestId: "req-9",
      userId: "bo",
      spaceKey: "pod-1",
    });

    expect(result.current.phase).toBe("walking");
  });
});
