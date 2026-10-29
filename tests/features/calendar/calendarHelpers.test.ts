import {
  eventDateKey,
  fromGoogleEvent,
  getEventsForDay,
  getWeekDays,
  getWeekRange,
} from "@features/calendar/helpers";
import type { GoogleCalendarEvent } from "@services/calendar";

function googleEvent(
  overrides: Partial<GoogleCalendarEvent> = {},
): GoogleCalendarEvent {
  return {
    id: "e1",
    title: "Backend standup",
    start: "2026-10-27T10:00:00+01:00",
    end: "2026-10-27T10:30:00+01:00",
    allDay: false,
    status: "confirmed",
    response: "accepted",
    location: "Room 2",
    meetingUrl: "https://meet.google.com/abc-defg-hij",
    url: null,
    ...overrides,
  };
}

describe("fromGoogleEvent", () => {
  it("keeps the times, location and meeting link", () => {
    const event = fromGoogleEvent(googleEvent());

    expect(event).toMatchObject({
      id: "e1",
      title: "Backend standup",
      location: "Room 2",
      meetingUrl: "https://meet.google.com/abc-defg-hij",
      allDay: false,
    });
  });

  it("fills in a missing title and location", () => {
    const event = fromGoogleEvent(googleEvent({ title: null, location: null }));

    expect(event.title).toBe("(No title)");
    expect(event.location).toBe("");
  });

  it("is live only while it is running", () => {
    const during = new Date("2026-10-27T09:15:00Z");
    const after = new Date("2026-10-27T09:30:00Z");

    expect(fromGoogleEvent(googleEvent(), during).live).toBe(true);
    expect(fromGoogleEvent(googleEvent(), after).live).toBe(false);
  });

  it("never marks an all-day event live", () => {
    const event = fromGoogleEvent(
      googleEvent({ allDay: true, start: "2026-10-27", end: "2026-10-28" }),
      new Date(2026, 9, 27, 12),
    );

    expect(event.live).toBe(false);
  });
});

describe("eventDateKey", () => {
  it("uses an all-day event's date as it is, whatever the time zone", () => {
    expect(eventDateKey({ start: "2026-10-27", allDay: true })).toBe(
      "2026-10-27",
    );
  });
});

describe("getEventsForDay", () => {
  it("lists all-day events first, then by start time", () => {
    const events = [
      fromGoogleEvent(
        googleEvent({ id: "late", start: "2026-10-27T15:00:00" }),
      ),
      fromGoogleEvent(
        googleEvent({ id: "all", allDay: true, start: "2026-10-27" }),
      ),
      fromGoogleEvent(
        googleEvent({ id: "early", start: "2026-10-27T08:00:00" }),
      ),
      fromGoogleEvent(
        googleEvent({ id: "other", start: "2026-10-28T08:00:00" }),
      ),
    ];

    expect(getEventsForDay(events, "2026-10-27").map((e) => e.id)).toEqual([
      "all",
      "early",
      "late",
    ]);
  });
});

describe("getWeekRange", () => {
  it("runs from Monday's midnight to the next Monday's", () => {
    const days = getWeekDays(new Date(2026, 9, 28, 15));
    const { from, to } = getWeekRange(days);

    expect(new Date(from)).toEqual(new Date(2026, 9, 26));
    expect(new Date(to)).toEqual(new Date(2026, 10, 2));
  });
});
