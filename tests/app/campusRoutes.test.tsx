import type { ServerMessage } from "@shared/lib/ws";
import { useWorldStore } from "@store/world";
import { act, render, screen } from "@testing-library/react-native";
import React from "react";

import Spaces from "../../src/app/(app)/(tabs)/(campus)/spaces";
import SpaceIndex from "../../src/app/(app)/space/[id]/index";

const mockParams = { id: "library" };

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    canGoBack: () => true,
  }),
  useLocalSearchParams: () => mockParams,
}));

// The space screen walks you there and asks to join over the world socket.
jest.mock("@shared/hooks/useWs", () => ({
  useWs: () => ({
    send: jest.fn(() => true),
    subscribe: () => () => {},
    status: "open",
    socket: null,
  }),
}));

// The spaces read the calendar for live meetings; none here.
jest.mock("@features/campus/hooks/useHappeningNow", () => ({
  useHappeningNow: () => [],
}));

function arrive() {
  useWorldStore.getState().apply({
    type: "snapshot",
    players: [],
    spaces: [{ spaceKey: "library", name: "Library" }],
    lockableSpaces: [],
    lockedSpaces: [],
  } as unknown as ServerMessage);
}

describe("campus routes", () => {
  beforeEach(() => {
    useWorldStore.getState().reset();
    mockParams.id = "library";
  });

  it("renders the spaces route", async () => {
    await render(<Spaces />);

    expect(screen.getByText("All spaces")).toBeTruthy();
    expect(screen.getByLabelText("Go back")).toBeTruthy();
  });

  it("waits for the map before showing a space", async () => {
    await render(<SpaceIndex />);

    expect(screen.getByText("Campus is loading…")).toBeTruthy();
    expect(screen.getByLabelText("Go back")).toBeTruthy();
  });

  it("passes the space it names to the space screen", async () => {
    await render(<SpaceIndex />);
    await act(() => arrive());

    expect(screen.getByText("Library")).toBeTruthy();
  });

  it("says when the space isn't on the map", async () => {
    mockParams.id = "gone";
    await render(<SpaceIndex />);
    await act(() => arrive());

    expect(
      screen.getByText("This space isn't on the map any more."),
    ).toBeTruthy();
  });
});
