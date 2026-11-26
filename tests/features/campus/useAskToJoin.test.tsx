import { useAskToJoin } from "@features/campus/hooks/useAskToJoin";
import { useEntryRequestWatcher } from "@features/campus/hooks/useEntryRequestWatcher";
import { useEntryRequestStore } from "@features/campus/store/entryRequest";
import type { ServerMessage } from "@shared/lib/ws";
import { useWorldStore } from "@store/world";
import { act, renderHook } from "@testing-library/react-native";

const mockSend = jest.fn(() => true);
const mockListeners = new Set<(message: unknown) => void>();
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();

jest.mock("@shared/hooks/useWs", () => ({
  useWs: () => ({
    send: mockSend,
    subscribe: (listener: (message: unknown) => void) => {
      mockListeners.add(listener);
      return () => mockListeners.delete(listener);
    },
  }),
}));

jest.mock("@shared/components/atoms", () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
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

const named = (userId = "me") => ({
  type: "entryRequested",
  requestId: "req-1",
  userId,
  spaceKey: "pod-1",
});

const ended = (outcome: string) => ({
  type: "entryRequestEnded",
  requestId: "req-1",
  userId: "me",
  spaceKey: "pod-1",
  outcome,
  answeredBy: outcome === "admitted" || outcome === "declined" ? "ada" : null,
});

/** The screen's hook, with the app-wide watcher running beside it. */
async function render() {
  await renderHook(() => useEntryRequestWatcher());
  return renderHook(() => useAskToJoin("pod-1", "Study Pod 1"));
}

async function askAtDoor() {
  const hook = await render();
  await act(() => {
    hook.result.current.ask();
  });
  await emit(refusedAtDoor(true));
  await emit(named());
  return hook;
}

const request = () => useEntryRequestStore.getState().request;

describe("asking to join a locked space", () => {
  beforeEach(() => {
    mockSend.mockClear();
    mockToastSuccess.mockClear();
    mockToastError.mockClear();
    mockListeners.clear();
    useEntryRequestStore.getState().clear();
    useWorldStore.getState().reset();
    useWorldStore.getState().apply({
      type: "welcome",
      userId: "me",
      mode: "avatar",
    } as ServerMessage);
  });

  it("walks to the door, then asks once it's refused there", async () => {
    const { result } = await render();

    await act(() => {
      result.current.ask();
    });
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

  it("waits once world takes the request", async () => {
    const { result } = await askAtDoor();

    expect(result.current.phase).toBe("waiting");
    expect(request()?.requestId).toBe("req-1");
  });

  it("walks in on a yes and pings you, wherever you are", async () => {
    await askAtDoor();
    mockSend.mockClear();

    await emit(ended("admitted"));

    expect(request()?.phase).toBe("entering");
    expect(mockSend).toHaveBeenCalledWith({
      type: "goToSpace",
      spaceKey: "pod-1",
    });
    expect(mockToastSuccess).toHaveBeenCalledWith("You're in Study Pod 1");

    await emit({ type: "walkEnded", toSpaceKey: "pod-1", reason: "arrived" });
    expect(request()).toBeNull();
  });

  it("says so when the answer is no", async () => {
    const { result } = await askAtDoor();

    await emit(ended("declined"));

    expect(result.current.phase).toBe("ended");
    expect(result.current.reason).toBe(
      "They said no this time. You can ask again in 30 seconds.",
    );
    expect(mockToastError).toHaveBeenCalled();
  });

  it("doesn't ask when nobody inside can answer", async () => {
    const { result } = await render();
    await act(() => {
      result.current.ask();
    });

    await emit(refusedAtDoor(false));

    expect(mockSend).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: "requestEntry" }),
    );
    expect(result.current.reason).toBe(
      "Nobody inside can let you in right now.",
    );
  });

  it("withdraws a request world has named", async () => {
    const { result } = await askAtDoor();

    await act(() => result.current.cancel());
    expect(mockSend).toHaveBeenLastCalledWith({
      type: "withdrawEntryRequest",
      requestId: "req-1",
    });

    await emit(ended("withdrawn"));
    expect(request()).toBeNull();
  });

  it("withdraws a request cancelled before world named it, once it does", async () => {
    const { result } = await render();
    await act(() => {
      result.current.ask();
    });
    await emit(refusedAtDoor(true));

    // Cancelled between asking and world naming the request.
    await act(() => result.current.cancel());
    await emit(named());

    expect(mockSend).toHaveBeenLastCalledWith({
      type: "withdrawEntryRequest",
      requestId: "req-1",
    });
    await emit(ended("withdrawn"));
    expect(request()).toBeNull();
  });

  it("stops the walk when cancelled on the way to the door", async () => {
    const { result } = await render();
    await act(() => {
      result.current.ask();
    });

    await act(() => result.current.cancel());
    expect(mockSend).toHaveBeenLastCalledWith({ type: "stopWalking" });

    await emit({ type: "walkEnded", toSpaceKey: "pod-1", reason: "stopped" });
    expect(request()).toBeNull();
  });

  it("ignores somebody else's request", async () => {
    const { result } = await render();
    await act(() => {
      result.current.ask();
    });
    await emit(refusedAtDoor(true));

    await emit(named("bo"));

    expect(result.current.phase).toBe("walking");
  });
});
