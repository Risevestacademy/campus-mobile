import type { ServerMessage } from "@shared/lib/ws";
import { useWorldStore } from "@store/world";
import { act, fireEvent, render, screen } from "@testing-library/react-native";

import { BroadcastBanner } from "../../../src/feature/room/components/BroadcastBanner";
import { useBroadcastStore } from "../../../src/feature/room/store/broadcast";

const mockToastError = jest.fn();

// The shared components barrel brings in expo-router.
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock("@shared/components/atoms", () => ({
  ...jest.requireActual("@shared/components/atoms"),
  toast: {
    success: jest.fn(),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

const setMicrophoneEnabled = jest.fn();
const room = { localParticipant: { setMicrophoneEnabled } };

function knowPlayers() {
  useWorldStore
    .getState()
    .apply({ type: "welcome", userId: "me", mode: "avatar" } as ServerMessage);
  useWorldStore.getState().apply({
    type: "snapshot",
    players: [
      {
        userId: "ada",
        x: 0,
        y: 0,
        facing: "down",
        displayName: "Ada",
        spriteKey: null,
        status: "available",
        statusUntil: null,
        spaceKey: "library",
      },
    ],
    spaces: [],
    lockedSpaces: [],
  } as unknown as ServerMessage);
}

const sync = (
  next: Parameters<ReturnType<typeof useBroadcastStore.getState>["sync"]>[0],
) => act(() => useBroadcastStore.getState().sync(next));

describe("BroadcastBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useBroadcastStore.getState().reset();
    useWorldStore.getState().reset();
    knowPlayers();
  });

  it("stays hidden while nobody broadcasts", async () => {
    await render(<BroadcastBanner />);
    await sync({ room: room as never });

    expect(screen.queryByTestId("broadcast-banner")).toBeNull();
  });

  it("says who is broadcasting, with nothing to mute", async () => {
    await render(<BroadcastBanner />);
    await sync({ room: room as never, speakers: ["ada"] });

    expect(screen.getByText("Ada")).toBeTruthy();
    expect(screen.getByText("LIVE")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("lets an admin start and end their own broadcast", async () => {
    await render(<BroadcastBanner />);
    await sync({ room: room as never, canSpeak: true });

    await fireEvent.press(screen.getByLabelText("Broadcast to campus"));
    expect(setMicrophoneEnabled).toHaveBeenLastCalledWith(true);

    await sync({ speaking: true });
    expect(screen.getByText("You")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("End your broadcast"));
    expect(setMicrophoneEnabled).toHaveBeenLastCalledWith(false);
  });

  it("says so when the microphone can't be used", async () => {
    setMicrophoneEnabled.mockRejectedValueOnce(new Error("denied"));
    await render(<BroadcastBanner />);
    await sync({ room: room as never, canSpeak: true });

    await fireEvent.press(screen.getByLabelText("Broadcast to campus"));

    expect(mockToastError).toHaveBeenCalledWith(
      "Allow Campus to use your microphone in Settings to broadcast.",
      "Can't broadcast",
    );
  });
});
