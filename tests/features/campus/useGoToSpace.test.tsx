import { useGoToSpace } from "@features/campus/hooks/useGoToSpace";
import { act, renderHook } from "@testing-library/react-native";

const mockListeners = new Set<(message: unknown) => void>();
const mockToastError = jest.fn();

jest.mock("@shared/hooks/useWs", () => ({
  useWs: () => ({
    send: () => true,
    subscribe: (listener: (message: unknown) => void) => {
      mockListeners.add(listener);
      return () => mockListeners.delete(listener);
    },
    status: "open",
    socket: null,
  }),
}));

jest.mock("@shared/components/atoms", () => ({
  toast: {
    success: jest.fn(),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

type Target = { toSpaceKey?: string; userId?: string };

const frame = (target: Target) => ({
  userId: target.userId ?? null,
  toSpaceKey: target.toSpaceKey ?? null,
  toTile: null,
  player: {},
});

const emit = (message: unknown) =>
  act(() => mockListeners.forEach((listener) => listener(message)));

const walking = (target: Target) => emit({ type: "walking", ...frame(target) });

const walkEnded = (target: Target, reason: string) =>
  emit({
    type: "walkEnded",
    ...frame(target),
    reason,
    spaceKey: null,
    mayAsk: false,
  });

async function walkToAThenB() {
  const hook = await renderHook(() => useGoToSpace());
  await act(() => {
    hook.result.current.goToSpace("a", "Space A");
  });
  await walking({ toSpaceKey: "a" });
  await act(() => {
    hook.result.current.goToSpace("b", "Space B");
  });
  return hook;
}

describe("useGoToSpace", () => {
  beforeEach(() => {
    mockListeners.clear();
    mockToastError.mockClear();
  });

  it("keeps walking to B when the walk to A it replaced ends late", async () => {
    const { result } = await walkToAThenB();

    await walkEnded({ toSpaceKey: "a" }, "stopped");

    expect(result.current.walkingTo).toBe("b");
  });

  it("still reports B's refusal after A's late end", async () => {
    const { result } = await walkToAThenB();

    await walkEnded({ toSpaceKey: "a" }, "stopped");
    await walkEnded({ toSpaceKey: "b" }, "refused");

    expect(result.current.walkingTo).toBeNull();
    expect(mockToastError).toHaveBeenCalledWith(
      "Space B is closed to you right now.",
      "Can't get in",
    );
  });

  it("ignores a late step towards A", async () => {
    const { result } = await walkToAThenB();

    await walking({ toSpaceKey: "a" });

    expect(result.current.walkingTo).toBe("b");
  });

  it("stops when a walk to somebody takes over", async () => {
    const { result } = await walkToAThenB();

    await walking({ userId: "ada" });

    expect(result.current.walkingTo).toBeNull();
  });

  it("stops when another space walk it didn't start takes over", async () => {
    const { result } = await walkToAThenB();

    await walking({ toSpaceKey: "c" });

    expect(result.current.walkingTo).toBeNull();
  });
});
