import { useCurrentCall } from "@features/campus";
import type { ServerMessage } from "@shared/lib/ws";
import { useWorldStore } from "@store/world";
import { act, renderHook } from "@testing-library/react-native";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock("@shared/hooks/useMe", () => ({
  useMe: () => ({
    data: { user: { displayName: "Kemi O.", avatarUrl: null } },
  }),
}));

const apply = (message: unknown) =>
  useWorldStore.getState().apply(message as ServerMessage);

const player = (userId: string) => ({
  userId,
  x: 0,
  y: 0,
  facing: "down",
  displayName: userId,
  spriteKey: null,
  status: "available",
  spaceKey: "library",
});

describe("useCurrentCall", () => {
  beforeEach(() => {
    useWorldStore.getState().reset();
    apply({ type: "welcome", userId: "me" });
    apply({
      type: "snapshot",
      players: [player("me"), player("Ada"), player("Cy")],
      spaces: [{ spaceKey: "library", name: "Library" }],
    });
  });

  it("is null while nobody is in earshot", async () => {
    const { result } = await renderHook(() => useCurrentCall());

    expect(result.current).toBeNull();
  });

  it("puts you first, with your own initial, then everyone in earshot", async () => {
    const { result } = await renderHook(() => useCurrentCall());

    await act(() => apply({ type: "nearby", userIds: ["Ada", "Cy"] }));

    expect(result.current?.space).toBe("Library");
    expect(result.current?.participants).toEqual([
      expect.objectContaining({ name: "You", initial: "K" }),
      expect.objectContaining({ name: "Ada" }),
      expect.objectContaining({ name: "Cy" }),
    ]);
  });

  it("toggles mute", async () => {
    const { result } = await renderHook(() => useCurrentCall());
    await act(() => apply({ type: "nearby", userIds: ["Ada"] }));

    await act(() => result.current?.onToggleMute());

    expect(result.current?.muted).toBe(true);
  });
});
