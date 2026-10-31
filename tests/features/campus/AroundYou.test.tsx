import { HappeningAroundYou } from "@features/campus/components";
import type { Avatar } from "@shared/lib/generated/world-protocol";
import type { ServerMessage } from "@shared/lib/ws";
import { useWorldStore } from "@store/world";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

const mockSend = jest.fn();

jest.mock("@shared/hooks/useWs", () => ({
  useWs: () => ({ send: mockSend }),
}));

jest.mock("@shared/hooks/useMe", () => ({
  useMe: () => ({ data: { user: { displayName: "Me", avatarUrl: null } } }),
}));

jest.mock("@shared/hooks/ui", () => ({
  useMeetingJoin: () => ({ open: jest.fn() }),
}));

function player(userId: string, overrides: Partial<Avatar> = {}): Avatar {
  return {
    userId,
    x: 0,
    y: 0,
    facing: "down",
    displayName: userId,
    spriteKey: null,
    status: "available",
    spaceKey: "library",
    ...overrides,
  };
}

const apply = (message: unknown) =>
  useWorldStore.getState().apply(message as ServerMessage);

function arrive(...others: Avatar[]) {
  apply({ type: "welcome", userId: "Me" });
  apply({
    type: "snapshot",
    players: [player("Me"), ...others],
    spaces: [{ spaceKey: "library", name: "Library" }],
  });
}

describe("HappeningAroundYou", () => {
  beforeEach(() => {
    mockSend.mockClear();
    useWorldStore.getState().reset();
  });

  it("shows nothing before world's first snapshot", async () => {
    await render(<HappeningAroundYou />);

    expect(screen.queryByText("AROUND YOU")).toBeNull();
  });

  it("says so when nobody else is in your space", async () => {
    arrive();
    await render(<HappeningAroundYou />);

    expect(screen.getByText("Library")).toBeTruthy();
    expect(screen.getByText("Nobody else is here right now.")).toBeTruthy();
  });

  it("lists people in your space with their status, Wave and Navigate", async () => {
    arrive(player("Bo", { status: "busy" }));
    await render(<HappeningAroundYou />);

    expect(screen.getByText("Bo")).toBeTruthy();
    expect(screen.getByText("Busy · Library")).toBeTruthy();
    expect(screen.getByLabelText("Wave at Bo")).toBeTruthy();
    expect(screen.getByLabelText("Navigate to Bo")).toBeTruthy();
    expect(screen.queryByText("Join")).toBeNull();
  });

  it("shows the conversation within earshot as the call you're in", async () => {
    arrive(player("Ada"), player("Cy"), player("Bo"));
    await render(<HappeningAroundYou />);

    await act(() => apply({ type: "nearby", userIds: ["Ada", "Cy"] }));

    // You're in the call too, first, as in the floating call.
    expect(screen.getByText("You, Ada & Cy")).toBeTruthy();
    const inCall = screen.getByLabelText("In call with You, Ada & Cy");
    expect(inCall.props.accessibilityState).toEqual({ disabled: true });
    expect(screen.queryByText("Join")).toBeNull();
    expect(screen.queryByLabelText("Wave at You, Ada & Cy")).toBeNull();
    // Bo is in the space but out of earshot: listed on their own.
    expect(screen.getByLabelText("Wave at Bo")).toBeTruthy();
  });

  it("asks world to take you to someone when you tap Navigate", async () => {
    arrive(player("Bo"));
    await render(<HappeningAroundYou />);

    await fireEvent.press(screen.getByLabelText("Navigate to Bo"));

    expect(mockSend).toHaveBeenCalledWith({ type: "goTo", userId: "Bo" });
  });
});
