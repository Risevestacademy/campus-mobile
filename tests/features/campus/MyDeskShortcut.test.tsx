import { MyDeskShortcut } from "@features/campus/components";
import type { ServerMessage } from "@shared/lib/ws";
import { useWorldStore } from "@store/world";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

const mockSend = jest.fn(() => true);
const mockToastError = jest.fn();
const mockWs = {
  listener: null as ((message: ServerMessage) => void) | null,
  status: "open",
  socket: {} as object,
};
let mockTarget: { spaceKey: string; name: string } | null;
let mockPreview: { spaceKey: string; name: string } | null;

jest.mock("@shared/hooks/useWs", () => ({
  useWs: () => ({
    send: mockSend,
    status: mockWs.status,
    socket: mockWs.socket,
    subscribe: (listener: (message: ServerMessage) => void) => {
      mockWs.listener = listener;
      return () => {
        mockWs.listener = null;
      };
    },
  }),
}));

jest.mock("@shared/hooks/useDesks", () => ({
  useMyDesk: () => ({ key: "desk_a1" }),
  deskTarget: () => mockTarget,
}));

jest.mock("@features/campus/hooks/useDeskPreview", () => ({
  useDeskPreview: () => mockPreview,
}));

jest.mock("@shared/components/atoms", () => ({
  ...jest.requireActual("@shared/components/atoms"),
  toast: { error: (...args: unknown[]) => mockToastError(...args) },
}));

const apply = (message: unknown) =>
  useWorldStore.getState().apply(message as ServerMessage);

function standIn(spaceKey: string) {
  apply({ type: "welcome", userId: "me" });
  apply({
    type: "snapshot",
    players: [{ userId: "me", spaceKey, status: "available" }],
    spaces: [
      { spaceKey: "library", name: "Library" },
      { spaceKey: "desk_a1", name: "Desk A1" },
    ],
  });
}

const walkEnded = (reason: string) =>
  act(() =>
    mockWs.listener?.({
      type: "walkEnded",
      userId: null,
      toSpaceKey: "desk_a1",
      toTile: null,
      reason,
      player: { userId: "me", x: 0, y: 0, facing: "down" },
      spaceKey: "desk_a1",
      mayAsk: false,
    } as ServerMessage),
  );

describe("MyDeskShortcut", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useWorldStore.getState().reset();
    mockWs.status = "open";
    mockTarget = { spaceKey: "desk_a1", name: "Desk A1" };
    mockPreview = null;
  });

  it("shows nothing while the API can't say where the desk is", async () => {
    mockTarget = null;
    standIn("library");

    await render(<MyDeskShortcut />);

    expect(screen.queryByText("Go to my desk")).toBeNull();
    expect(screen.queryByText("At your desk")).toBeNull();
  });

  it("previews on a stand-in space in development builds", async () => {
    mockTarget = null;
    mockPreview = { spaceKey: "desk_a1", name: "Desk A1" };
    standIn("library");
    await render(<MyDeskShortcut />);

    await fireEvent.press(screen.getByText("Go to my desk"));

    expect(mockSend).toHaveBeenCalledWith({
      type: "goToSpace",
      spaceKey: "desk_a1",
    });
  });

  it("shows nothing before campus has loaded", async () => {
    await render(<MyDeskShortcut />);

    expect(screen.queryByText("Go to my desk")).toBeNull();
  });

  it("says so when you're already at your desk", async () => {
    standIn("desk_a1");

    await render(<MyDeskShortcut />);

    expect(screen.getByText("At your desk")).toBeTruthy();
    expect(screen.queryByText("Go to my desk")).toBeNull();
  });

  it("walks you there, then stops showing the walk", async () => {
    standIn("library");
    await render(<MyDeskShortcut />);

    await fireEvent.press(screen.getByText("Go to my desk"));

    expect(mockSend).toHaveBeenCalledWith({
      type: "goToSpace",
      spaceKey: "desk_a1",
    });
    expect(screen.getByText("Walking to your desk")).toBeTruthy();

    await walkEnded("arrived");

    expect(screen.getByText("Go to my desk")).toBeTruthy();
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("says why when the desk is closed to you", async () => {
    standIn("library");
    await render(<MyDeskShortcut />);
    await fireEvent.press(screen.getByText("Go to my desk"));

    await walkEnded("refused");

    expect(mockToastError).toHaveBeenCalledWith(
      "Desk A1 is closed to you right now.",
      "Can't get in",
    );
  });

  it("says so when it can't send the walk", async () => {
    mockSend.mockReturnValueOnce(false);
    standIn("library");
    await render(<MyDeskShortcut />);

    await fireEvent.press(screen.getByText("Go to my desk"));

    expect(mockToastError).toHaveBeenCalledWith(
      "You're not connected to campus right now.",
      "Can't walk there",
    );
    expect(screen.getByText("Go to my desk")).toBeTruthy();
  });
});
