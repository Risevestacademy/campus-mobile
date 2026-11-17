import {
  claimDelay,
  useClaimEmptyAvatar,
} from "@core/realtime/useClaimEmptyAvatar";
import type { ServerMessage } from "@shared/lib/ws";
import { useWorldStore } from "@store/world";
import { act, renderHook } from "@testing-library/react-native";

const mockReconnect = jest.fn();

jest.mock("@shared/hooks/useWs", () => ({
  useWs: () => ({ reconnect: mockReconnect }),
}));

const apply = (message: unknown) =>
  act(() => useWorldStore.getState().apply(message as ServerMessage));

const me = {
  userId: "me",
  displayName: "Me",
  status: "available",
  statusUntil: null,
  spaceKey: "library",
};

describe("useClaimEmptyAvatar", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockReconnect.mockClear();
    useWorldStore.getState().reset();
  });

  afterEach(() => jest.useRealTimers());

  async function watchingMe() {
    await renderHook(() => useClaimEmptyAvatar());
    await apply({ type: "welcome", userId: "me", mode: "watcher" });
    await apply({ type: "snapshot", players: [me], spaces: [] });
  }

  it("leaves things be while the other device stands for you", async () => {
    await watchingMe();

    await act(() => jest.advanceTimersByTime(60_000));

    expect(mockReconnect).not.toHaveBeenCalled();
  });

  it("tries to stand in with ifFree once the other device leaves", async () => {
    await watchingMe();

    await apply({ type: "left", userId: "me" });
    await act(() => jest.advanceTimersByTime(0));

    expect(mockReconnect).toHaveBeenCalledWith("ifFree");
  });

  it("backs off while world still holds the avatar", () => {
    expect([0, 1, 2, 3, 10].map(claimDelay)).toEqual([
      0, 2_000, 4_000, 8_000, 30_000,
    ]);
  });
});
