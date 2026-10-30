import CalendarScreen from "@features/calendar/screens/CalendarScreen";
import { render, screen } from "@testing-library/react-native";
import React from "react";

const mockUseCalendarEvents = jest.fn();

jest.mock("../../../src/feature/calendar/hooks", () => ({
  useCalendarEvents: () => mockUseCalendarEvents(),
  useConnectGoogleCalendar: () => ({ connect: jest.fn(), isConnecting: false }),
  useLiveEvents: jest.requireActual(
    "../../../src/feature/calendar/hooks/useLiveEvents",
  ).useLiveEvents,
}));

const today = new Date();
const at = (hour: number) =>
  new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    hour,
  ).toISOString();

describe("CalendarScreen", () => {
  it("offers to connect when no calendar is connected", async () => {
    mockUseCalendarEvents.mockReturnValue({
      data: { connected: false, events: [], truncated: false },
      isLoading: false,
      isError: false,
    });

    await render(<CalendarScreen />);

    expect(screen.getAllByText("Connect Google Calendar").length).toBe(2);
    expect(screen.queryByText("Synced with Google Calendar")).toBeNull();
  });

  it("shows today's Google events once connected", async () => {
    mockUseCalendarEvents.mockReturnValue({
      data: {
        connected: true,
        truncated: false,
        events: [
          {
            id: "e1",
            title: "Backend standup",
            start: at(23),
            end: at(23),
            allDay: false,
            status: "confirmed",
            response: null,
            location: "Room 2",
            meetingUrl: null,
            url: null,
          },
        ],
      },
      isLoading: false,
      isError: false,
    });

    await render(<CalendarScreen />);

    expect(screen.getByText("Synced with Google Calendar")).toBeTruthy();
    expect(screen.getByText("Backend standup")).toBeTruthy();
    expect(screen.queryByText("Connect Google Calendar")).toBeNull();
  });

  it("offers a retry when the events fail to load", async () => {
    mockUseCalendarEvents.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
    });

    await render(<CalendarScreen />);

    expect(screen.getByText("Couldn't load your calendar.")).toBeTruthy();
    expect(screen.getByText("Try again")).toBeTruthy();
  });
});
