import { LiveMeeting } from "@features/campus/components/LiveMeeting";
import type { LiveMeetingItem } from "@features/campus/types";
import type { Avatar } from "@shared/lib/generated/world-protocol";
import type { ServerMessage } from "@shared/lib/ws";
import { useWorldStore } from "@store/world";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

// Six minutes into the room meeting, 36 into the video call.
const mockNow = Date.parse("2026-11-26T10:06:00.000Z");
const mockPush = jest.fn();
const mockOpenSheet = jest.fn();
let mockLive: LiveMeetingItem[] = [];

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
}));

jest.mock("@features/campus/hooks/useHappeningNow", () => ({
  useHappeningNow: () => mockLive,
  useMinuteClock: () => mockNow,
}));

jest.mock("@shared/hooks/ui", () => ({
  useMeetingJoin: () => ({ open: mockOpenSheet }),
}));

jest.mock("@shared/hooks/useWs", () => ({
  useWs: () => ({
    send: jest.fn(() => true),
    subscribe: () => () => {},
    status: "open",
    socket: null,
  }),
}));

const inRoom: LiveMeetingItem = {
  id: "event-1",
  title: "Design Foundations",
  location: "Classroom A",
  startsAt: "2026-11-26T10:00:00.000Z",
  join: {
    kind: "campus",
    code: "abc",
    spaceKey: "classroom-a",
    spaceName: "Classroom A",
  },
};

const onVideo: LiveMeetingItem = {
  id: "event-2",
  title: "Standup",
  location: "",
  startsAt: "2026-11-26T09:30:00.000Z",
  join: { kind: "external", url: "https://meet.example/abc" },
};

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

describe("LiveMeeting", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLive = [];
    useWorldStore.getState().reset();
    useWorldStore.getState().apply({
      type: "snapshot",
      players: [
        player("Chiemezie", "classroom-a"),
        player("Ada", "classroom-a"),
      ],
      spaces: [{ spaceKey: "classroom-a", name: "Classroom A" }],
      lockableSpaces: [],
      lockedSpaces: [],
    } as unknown as ServerMessage);
  });

  it("shows nothing while no meeting is on", async () => {
    await render(<LiveMeeting />);

    expect(screen.queryByText("LIVE")).toBeNull();
  });

  it("shows the meeting on now, how long it's been on, and who's in", async () => {
    mockLive = [inRoom];
    await render(<LiveMeeting />);

    expect(screen.getByText("Design Foundations")).toBeTruthy();
    expect(screen.getByText("Classroom A · started 6 min ago")).toBeTruthy();
    expect(screen.getByText("Ada + 1 other")).toBeTruthy();
  });

  it("opens the room's page from Details", async () => {
    mockLive = [inRoom];
    await render(<LiveMeeting />);

    await fireEvent.press(screen.getByText("Details"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/space/[id]",
      params: { id: "classroom-a" },
    });
  });

  it("joins a room through the join sheet", async () => {
    mockLive = [inRoom];
    await render(<LiveMeeting />);

    await fireEvent.press(screen.getByText("Join Meeting"));

    expect(mockOpenSheet).toHaveBeenCalledWith(
      expect.objectContaining({
        spaceKey: "classroom-a",
        title: "Design Foundations",
        onJoin: expect.any(Function),
      }),
    );
  });

  it("skips a video call for the room meeting after it", async () => {
    mockLive = [onVideo, inRoom];
    await render(<LiveMeeting />);

    expect(screen.getByText("Design Foundations")).toBeTruthy();
    expect(screen.queryByText("Standup")).toBeNull();
  });

  it("shows nothing for a video call alone: it can't be joined from campus", async () => {
    mockLive = [onVideo];
    await render(<LiveMeeting />);

    expect(screen.queryByText("Standup")).toBeNull();
    expect(screen.queryByText("LIVE")).toBeNull();
  });
});
