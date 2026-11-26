import { SpacesScreen } from "@features/campus";
import { matchesSpace, toCampusSpaces } from "@features/campus/helpers";
import type { LiveMeetingItem } from "@features/campus/types";
import type { Avatar } from "@shared/lib/generated/world-protocol";
import type { ServerMessage } from "@shared/lib/ws";
import { useWorldStore } from "@store/world";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
    canGoBack: () => false,
  }),
}));

let mockLive: LiveMeetingItem[] = [];

jest.mock("@features/campus/hooks/useHappeningNow", () => ({
  useHappeningNow: () => mockLive,
}));

/** A meeting on now in a room on your campus. */
const meetingIn = (spaceKey: string, title: string): LiveMeetingItem => ({
  id: `event-${spaceKey}`,
  title,
  location: spaceKey,
  startsAt: "2026-11-26T09:00:00.000Z",
  join: { kind: "campus", code: "abc", spaceKey, spaceName: spaceKey },
});

function player(userId: string, spaceKey: string): Avatar {
  return {
    userId,
    x: 0,
    y: 0,
    facing: "down",
    displayName: userId,
    spriteKey: null,
    status: "available",
    statusUntil: null,
    spaceKey,
  };
}

const SPACES = [
  { spaceKey: "_default", name: "Corridors" },
  { spaceKey: "library", name: "Library" },
  { spaceKey: "pod-1", name: "Study Pod 1" },
  { spaceKey: "pod-2", name: "Study Pod 2" },
];

function snapshot() {
  return {
    type: "snapshot",
    players: [
      player("Ada", "library"),
      player("Bo", "library"),
      player("Cy", "library"),
      player("Dee", "pod-1"),
      player("Eve", "_default"),
    ],
    spaces: SPACES,
    lockableSpaces: ["pod-1", "pod-2"],
    lockedSpaces: ["pod-1"],
  } as unknown as ServerMessage;
}

const world = () => {
  const state = useWorldStore.getState();
  return {
    spaces: state.spaces,
    players: state.players,
    lockedSpaces: state.lockedSpaces,
    lockableSpaces: state.lockableSpaces,
  };
};

describe("toCampusSpaces", () => {
  beforeEach(() => {
    useWorldStore.getState().reset();
    useWorldStore.getState().apply(snapshot());
  });

  it("lists every drawn space, not the corridors, with who is in it", () => {
    const spaces = toCampusSpaces(world());

    expect(spaces.map((s) => s.title)).toEqual([
      "Library",
      "Study Pod 1",
      "Study Pod 2",
    ]);
    expect(spaces[0]).toEqual({
      key: "library",
      title: "Library",
      subtitle: "Ada, Bo +1",
      people: ["Ada", "Bo", "Cy"],
      participants: 3,
      status: "occupied",
      type: "common",
    });
  });

  it("counts a lockable space as private, and says when it's locked", () => {
    const [, pod1, pod2] = toCampusSpaces(world());

    expect(pod1).toMatchObject({
      type: "private",
      status: "locked",
      subtitle: "Locked · Dee",
    });
    expect(pod2).toMatchObject({
      type: "private",
      status: "empty",
      subtitle: "Nobody here",
      participants: 0,
    });
  });

  it("filters by status and searches names and who is there", () => {
    const [library, pod1, pod2] = toCampusSpaces(world());

    expect(matchesSpace(pod2!, "empty", "")).toBe(true);
    expect(matchesSpace(library!, "empty", "")).toBe(false);
    expect(matchesSpace(pod1!, "locked", "")).toBe(true);
    // Somebody's name finds the space they're in.
    expect(matchesSpace(library!, "all", "bo")).toBe(true);
    expect(matchesSpace(pod2!, "all", "bo")).toBe(false);
  });
});

describe("toCampusSpaces with your calendar", () => {
  beforeEach(() => {
    useWorldStore.getState().reset();
    useWorldStore.getState().apply(snapshot());
  });

  it("marks a space live while its meeting is on, ahead of being locked", () => {
    const spaces = toCampusSpaces(world(), [meetingIn("pod-1", "Design crit")]);

    expect(spaces.find((s) => s.key === "pod-1")).toMatchObject({
      status: "live",
      meeting: "Design crit",
      subtitle: "Design crit · Locked · Dee",
    });
  });

  it("leaves out meetings held off campus", () => {
    const external: LiveMeetingItem = {
      ...meetingIn("library", "Standup"),
      join: { kind: "external", url: "https://meet.example/abc" },
    };

    const library = toCampusSpaces(world(), [external]).find(
      (s) => s.key === "library",
    );

    expect(library?.status).toBe("occupied");
  });

  it("finds a space by the meeting on there", () => {
    const [library] = toCampusSpaces(world(), [
      meetingIn("library", "Calculus II"),
    ]);

    expect(matchesSpace(library!, "live", "calculus")).toBe(true);
    expect(matchesSpace(library!, "occupied", "")).toBe(false);
  });
});

describe("SpacesScreen", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockLive = [];
    useWorldStore.getState().reset();
  });

  it("shows the spaces with a meeting on under Live now, marked LIVE", async () => {
    mockLive = [meetingIn("library", "Calculus II")];
    await render(<SpacesScreen />);
    await act(() => useWorldStore.getState().apply(snapshot()));

    await fireEvent.press(screen.getByText("Live now"));

    expect(screen.getByText("Library")).toBeTruthy();
    expect(screen.getByText("LIVE")).toBeTruthy();
    expect(screen.getByText("Calculus II · Ada, Bo +1")).toBeTruthy();
    expect(screen.queryByText("Study Pod 1")).toBeNull();
  });

  it("waits for world's first snapshot", async () => {
    await render(<SpacesScreen />);

    expect(screen.getByText("Campus is loading…")).toBeTruthy();
  });

  it("lists world's spaces in their sections, with the totals", async () => {
    await render(<SpacesScreen />);
    await act(() => useWorldStore.getState().apply(snapshot()));

    expect(screen.getByText("3 spaces · 4 people in them")).toBeTruthy();
    expect(screen.getByText("Private")).toBeTruthy();
    expect(screen.getByText("Common")).toBeTruthy();
    expect(screen.getByText("Library")).toBeTruthy();
    expect(screen.getByText("Study Pod 1")).toBeTruthy();
    expect(screen.queryByText("Corridors")).toBeNull();
  });

  it("follows people as they step between spaces", async () => {
    await render(<SpacesScreen />);
    await act(() => useWorldStore.getState().apply(snapshot()));

    await act(() =>
      useWorldStore.getState().apply({
        type: "spaceChanged",
        userId: "Eve",
        spaceKey: "pod-2",
      } as ServerMessage),
    );

    expect(screen.getByText("Eve")).toBeTruthy();
  });

  it("shows only empty spaces under Empty", async () => {
    await render(<SpacesScreen />);
    await act(() => useWorldStore.getState().apply(snapshot()));

    await fireEvent.press(screen.getByText("Empty"));

    expect(screen.getByText("Study Pod 2")).toBeTruthy();
    expect(screen.queryByText("Library")).toBeNull();
    expect(screen.queryByText("Study Pod 1")).toBeNull();
  });

  it("opens a space when you tap it", async () => {
    await render(<SpacesScreen />);
    await act(() => useWorldStore.getState().apply(snapshot()));

    await fireEvent.press(screen.getByText("Library"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/(tabs)/(campus)/space/[id]",
      params: { id: "library" },
    });
  });
});
