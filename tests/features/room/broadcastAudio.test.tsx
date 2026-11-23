import { act, renderHook } from "@testing-library/react-native";

import {
  DUCKED_VOLUME,
  useBroadcastDucking,
} from "../../../src/feature/room/hooks/useBroadcastDucking";
import { useBroadcastSync } from "../../../src/feature/room/hooks/useBroadcastSync";
import { useBroadcastStore } from "../../../src/feature/room/store/broadcast";

const mockRoom = { name: "broadcast-room" };
const mockLocal = { isMicrophoneEnabled: false };
let mockRemotes: {
  identity: string;
  isMicrophoneEnabled?: boolean;
  setVolume?: jest.Mock;
}[] = [];

jest.mock("@livekit/react-native", () => ({
  useRoomContext: () => mockRoom,
  useRemoteParticipants: () => mockRemotes,
  useLocalParticipant: () => mockLocal,
}));

beforeEach(() => {
  mockRemotes = [];
  mockLocal.isMicrophoneEnabled = false;
  useBroadcastStore.getState().reset();
});

describe("useBroadcastSync", () => {
  it("reports whoever has a live microphone in the broadcast room", async () => {
    mockRemotes = [
      { identity: "ada:1", isMicrophoneEnabled: true },
      { identity: "bo:1", isMicrophoneEnabled: false },
    ];

    await renderHook(() => useBroadcastSync(false));

    expect(useBroadcastStore.getState()).toMatchObject({
      room: mockRoom,
      canSpeak: false,
      speakers: ["ada"],
      speaking: false,
    });
  });

  it("knows when you, an admin, are broadcasting", async () => {
    mockLocal.isMicrophoneEnabled = true;

    await renderHook(() => useBroadcastSync(true));

    expect(useBroadcastStore.getState()).toMatchObject({
      canSpeak: true,
      speaking: true,
    });
  });

  it("clears it all on leaving the room", async () => {
    mockRemotes = [{ identity: "ada:1", isMicrophoneEnabled: true }];
    const { unmount } = await renderHook(() => useBroadcastSync(true));

    await unmount();

    expect(useBroadcastStore.getState()).toMatchObject({
      room: null,
      canSpeak: false,
      speakers: [],
    });
  });
});

describe("useBroadcastDucking", () => {
  it("plays the space call quieter while somebody broadcasts, then back up", async () => {
    const ada = { identity: "ada:1", setVolume: jest.fn() };
    mockRemotes = [ada];
    const { rerender } = await renderHook(() => useBroadcastDucking());
    expect(ada.setVolume).toHaveBeenLastCalledWith(1);

    await act(() => useBroadcastStore.getState().sync({ speakers: ["cy"] }));
    await rerender({});
    expect(ada.setVolume).toHaveBeenLastCalledWith(DUCKED_VOLUME);

    await act(() => useBroadcastStore.getState().sync({ speakers: [] }));
    await rerender({});
    expect(ada.setVolume).toHaveBeenLastCalledWith(1);
  });
});
