import { HappeningAroundYou } from "@features/campus/components";
import type { Avatar } from "@shared/lib/generated/world-protocol";
import type { ServerMessage } from "@shared/lib/ws";
import { useWorldStore } from "@store/world";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
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
    statusUntil: null,
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

  it("opens somebody's desk from their row", async () => {
    arrive(player("Bo"));
    await render(<HappeningAroundYou />);

    await fireEvent.press(screen.getByLabelText("Open Bo's desk"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/desk",
      params: { userId: "Bo" },
    });
  });

  it("lists people in your space with their status, Wave and Navigate", async () => {
    arrive(player("Bo", { status: "busy" }));
    await render(<HappeningAroundYou />);

    expect(screen.getByText("Bo")).toBeTruthy();
    // Status shows as a dot on the avatar, not in words.
    expect(screen.queryByText(/Busy/)).toBeNull();
    expect(screen.getAllByText("Library").length).toBeGreaterThan(0);
    expect(
      screen.getByLabelText("Open Bo's desk").props.accessibilityValue,
    ).toEqual({ text: "busy" });
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

  it("offers no walking or call while another device stands for you", async () => {
    arrive(player("Ada"), player("Bo"));
    await act(() => apply({ type: "watching" }));
    await render(<HappeningAroundYou />);

    await act(() => apply({ type: "nearby", userIds: ["Ada"] }));

    expect(screen.getByLabelText("Wave at Bo")).toBeTruthy();
    expect(screen.queryByLabelText("Navigate to Bo")).toBeNull();
    expect(screen.queryByLabelText(/^In call with/)).toBeNull();
  });
});
