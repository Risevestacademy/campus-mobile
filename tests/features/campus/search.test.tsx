import {
  searchCampus,
  toSearchHomeSections,
  toSearchSections,
} from "@features/campus/helpers";
import { SearchScreen } from "@features/campus/screens/SearchScreen";
import { CalendarService } from "@services/calendar";
import { useRecentSearchesStore } from "@store/recentSearches";
import type { Presence } from "@store/world";
import { useWorldStore } from "@store/world";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

const mockBack = jest.fn();
const mockPush = jest.fn();
const mockOpenMeeting = jest.fn();
const mockSend = jest.fn(() => true);
const mockListeners = new Set<(message: unknown) => void>();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

jest.mock("@shared/hooks/useWs", () => ({
  useWs: () => ({
    send: mockSend,
    subscribe: (listener: (message: unknown) => void) => {
      mockListeners.add(listener);
      return () => mockListeners.delete(listener);
    },
    status: "open",
    socket: null,
  }),
}));

let mockDesk: { spaceKey: string; name: string } | null = null;
let mockHoldsDesk = false;

jest.mock("@shared/hooks/useDesks", () => ({
  useMyDesk: () => (mockHoldsDesk ? { key: "desk_a1" } : null),
}));

jest.mock("@features/campus/hooks/useMyDeskTarget", () => ({
  useMyDeskTarget: () => mockDesk,
}));

const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();

jest.mock("@shared/components/atoms", () => ({
  ...jest.requireActual("@shared/components/atoms"),
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

jest.mock("@shared/hooks/ui", () => ({
  useMeetingJoin: () => ({ open: mockOpenMeeting }),
}));

const person = (
  userId: string,
  displayName: string,
  spaceKey = "library",
): Presence => ({
  userId,
  displayName,
  status: "available",
  spaceKey,
});

const world = {
  selfId: "me",
  lockedSpaces: ["studio"],
  players: {
    me: person("me", "Me"),
    ada: person("ada", "Ada Lovelace"),
    jose: person("jose", "José Ruiz", "studio"),
  },
  spaces: {
    _default: { spaceKey: "_default", name: "Corridors" },
    library: { spaceKey: "library", name: "Library" },
    studio: { spaceKey: "studio", name: "Design Studio" },
  },
};

describe("searchCampus", () => {
  it("lists everyone else and every drawn space for an empty query", () => {
    const results = searchCampus(world, "");

    expect(results.people?.map((r) => r.data.name)).toEqual([
      "Ada Lovelace",
      "José Ruiz",
    ]);
    expect(results.spaces?.map((r) => r.data.name)).toEqual([
      "Design Studio",
      "Library",
    ]);
  });

  it("matches names ignoring case and accents", () => {
    const results = searchCampus(world, "jose");

    expect(results.people?.map((r) => r.data.name)).toEqual(["José Ruiz"]);
    expect(results.spaces).toEqual([]);
  });

  it("says where people are and how many are in each space", () => {
    const results = searchCampus(world, "");

    expect(results.people?.[0]?.data).toMatchObject({
      status: "available",
      spaceName: "Library",
    });
    expect(results.spaces?.[1]?.data).toMatchObject({
      name: "Library",
      people: 2,
    });
  });
});

describe("toSearchSections", () => {
  const results = searchCampus(world, "");

  it("shows every type with results under All", () => {
    expect(toSearchSections(results, "all").map((s) => s.title)).toEqual([
      "People",
      "Spaces",
    ]);
  });

  it("shows only the chosen type", () => {
    expect(toSearchSections(results, "spaces").map((s) => s.title)).toEqual([
      "Spaces",
    ]);
  });

  it("drops types with nothing in them", () => {
    expect(toSearchSections(results, "meetings")).toEqual([]);
  });
});

describe("toSearchHomeSections", () => {
  it("leaves out empty sections but always offers quick actions", () => {
    expect(
      toSearchHomeSections({ live: [], recent: [] }).map((s) => s.title),
    ).toEqual(["Quick actions"]);
  });

  it("orders what's on now, then recent, then quick actions", () => {
    const sections = toSearchHomeSections({
      live: [{ id: "e1", title: "Crit", location: "", startsAt: "" }],
      recent: ["ada"],
    });
    expect(sections.map((s) => s.title)).toEqual([
      "Happening now",
      "Recent",
      "Quick actions",
    ]);
  });
});

function renderScreen() {
  const queryClient = new QueryClient({
    // No garbage-collection timers left running after the test.
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <SearchScreen />
    </QueryClientProvider>,
  );
}

const typeInSearch = (text: string) =>
  fireEvent.changeText(screen.getByLabelText("Search"), text);

describe("SearchScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useWorldStore.setState({ ...world, ready: true });
    useRecentSearchesStore.setState({ queries: [], hydrated: true });
    mockDesk = null;
    mockHoldsDesk = false;
    jest
      .spyOn(CalendarService, "getEvents")
      .mockResolvedValue({ connected: false, events: [], truncated: false });
  });

  it("starts on quick actions, not results", async () => {
    await renderScreen();

    expect(screen.getByText("Quick actions")).toBeTruthy();
    expect(screen.queryByText("Ada Lovelace")).toBeNull();
  });

  it("narrows results as you type, and clears back to the start", async () => {
    await renderScreen();

    await typeInSearch("studio");
    expect(screen.getByText("Design Studio")).toBeTruthy();
    expect(screen.queryByText("Ada Lovelace")).toBeNull();

    await fireEvent.press(screen.getByLabelText("Clear search"));
    expect(screen.getByText("Quick actions")).toBeTruthy();
  });

  it("says when nothing matches", async () => {
    await renderScreen();

    await typeInSearch("zzz");

    expect(screen.getByText("No results for “zzz”")).toBeTruthy();
  });

  it("heads each type under All", async () => {
    await renderScreen();

    await typeInSearch("a");

    // A heading with the count over each type's results.
    expect(screen.getByText("People · 1")).toBeTruthy();
  });

  it("filters to one type, without headings", async () => {
    await renderScreen();

    // The pills show once there are results to filter.
    await typeInSearch("a");
    await fireEvent.press(screen.getByRole("tab", { name: "Spaces" }));

    expect(screen.queryByText("Ada Lovelace")).toBeNull();
    expect(screen.getByText("Library")).toBeTruthy();
    // "People" and "Spaces" are left only as the pills' own labels.
    expect(screen.getAllByText("Spaces")).toHaveLength(1);
    expect(screen.getAllByText("People")).toHaveLength(1);
  });

  it("offers New meeting, My desk and Rise classroom", async () => {
    await renderScreen();

    for (const label of ["New meeting", "My desk", "Rise classroom"]) {
      expect(screen.getByRole("button", { name: label })).toBeTruthy();
    }
    expect(screen.queryByText("Open calendar")).toBeNull();
  });

  it("remembers a search, and runs it again from Recent", async () => {
    await renderScreen();

    await typeInSearch("ada");
    await fireEvent(screen.getByLabelText("Search"), "submitEditing");
    await fireEvent.press(screen.getByLabelText("Clear search"));

    expect(useRecentSearchesStore.getState().queries).toEqual(["ada"]);
    await fireEvent.press(screen.getByLabelText("Search for ada"));
    expect(screen.getByText("Ada Lovelace")).toBeTruthy();
  });

  it("removes one recent search, or clears them all", async () => {
    useRecentSearchesStore.setState({ queries: ["ada", "library"] });
    await renderScreen();

    await fireEvent.press(
      screen.getByLabelText("Remove ada from recent searches"),
    );
    expect(screen.queryByLabelText("Search for ada")).toBeNull();

    await fireEvent.press(screen.getByLabelText("Clear recent searches"));
    expect(screen.queryByText("Recent")).toBeNull();
  });

  it("shows what's on now from your calendar, and opens it", async () => {
    const start = new Date(Date.now() - 10 * 60_000).toISOString();
    const end = new Date(Date.now() + 20 * 60_000).toISOString();
    jest.spyOn(CalendarService, "getEvents").mockResolvedValue({
      connected: true,
      truncated: false,
      events: [
        {
          id: "e1",
          title: "Design crit",
          start,
          end,
          allDay: false,
          status: "confirmed",
          response: "accepted",
          location: "Studio",
          meetingUrl: null,
          url: null,
          room: null,
        },
      ],
    } as Awaited<ReturnType<typeof CalendarService.getEvents>>);
    await renderScreen();

    await fireEvent.press(
      await screen.findByLabelText("Design crit, live now"),
    );

    expect(screen.getByText("Happening now")).toBeTruthy();
    expect(mockOpenMeeting).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Design crit", location: "Studio" }),
    );
  });

  it("walks you to a person or a space", async () => {
    await renderScreen();
    await typeInSearch("a");

    await fireEvent.press(screen.getByLabelText("Go to Ada Lovelace"));
    expect(mockSend).toHaveBeenCalledWith({ type: "goTo", userId: "ada" });

    await fireEvent.press(screen.getByLabelText("Go to Library"));
    expect(mockSend).toHaveBeenCalledWith({
      type: "goToSpace",
      spaceKey: "library",
    });
    expect(mockToastSuccess).toHaveBeenCalledWith("Walking to Library");
  });

  it("says why when a space turns you away", async () => {
    await renderScreen();
    await typeInSearch("library");
    await fireEvent.press(screen.getByLabelText("Go to Library"));

    await act(() =>
      mockListeners.forEach((listener) =>
        listener({
          type: "walkEnded",
          userId: null,
          toSpaceKey: "library",
          toTile: null,
          reason: "refused",
          player: { userId: "me", x: 0, y: 0, facing: "down" },
          spaceKey: "library",
          mayAsk: false,
        }),
      ),
    );

    expect(mockToastError).toHaveBeenCalledWith(
      "Library is closed to you right now.",
      "Can't get in",
    );
  });

  it("says so, and doesn't claim to walk, when campus isn't connected", async () => {
    mockSend.mockReturnValueOnce(false);
    await renderScreen();
    await typeInSearch("library");

    await fireEvent.press(screen.getByLabelText("Go to Library"));

    expect(mockToastSuccess).not.toHaveBeenCalled();
    expect(mockToastError).toHaveBeenCalledWith(
      "You're not connected to campus right now.",
      "Can't walk there",
    );
  });

  it("marks locked spaces", async () => {
    await renderScreen();
    await fireEvent.changeText(screen.getByLabelText("Search"), "i");

    await fireEvent.press(screen.getByRole("tab", { name: "Spaces" }));

    expect(screen.getByLabelText("Locked")).toBeTruthy();
    expect(screen.getByLabelText("Open")).toBeTruthy();
  });

  it("walks you to your desk from My desk", async () => {
    mockDesk = { spaceKey: "studio", name: "Design Studio" };
    await renderScreen();

    await fireEvent.press(screen.getByRole("button", { name: "My desk" }));

    expect(mockSend).toHaveBeenCalledWith({
      type: "goToSpace",
      spaceKey: "studio",
    });
    expect(mockToastSuccess).toHaveBeenCalledWith("Walking to your desk");
  });

  it("says when you're already at your desk", async () => {
    // You stand in the library, per the fixture.
    mockDesk = { spaceKey: "library", name: "Library" };
    await renderScreen();

    await fireEvent.press(screen.getByRole("button", { name: "My desk" }));

    expect(mockSend).not.toHaveBeenCalled();
    expect(mockToastSuccess).toHaveBeenCalledWith(
      "You're already at your desk",
    );
  });

  it("says when you don't have a desk", async () => {
    await renderScreen();

    await fireEvent.press(screen.getByRole("button", { name: "My desk" }));

    expect(mockSend).not.toHaveBeenCalled();
    expect(mockToastError).toHaveBeenCalledWith(
      "Claim a desk first, then you can walk to it from here.",
      "No desk yet",
    );
  });

  it("says when your desk can't be placed on the map yet", async () => {
    mockHoldsDesk = true;
    await renderScreen();

    await fireEvent.press(screen.getByRole("button", { name: "My desk" }));

    expect(mockSend).not.toHaveBeenCalled();
    expect(mockToastError).toHaveBeenCalledWith(
      "Walking to desks isn't available yet.",
      "Can't get there",
    );
  });

  it("goes back", async () => {
    await renderScreen();

    await fireEvent.press(screen.getByLabelText("Back"));

    expect(mockBack).toHaveBeenCalled();
  });
});
