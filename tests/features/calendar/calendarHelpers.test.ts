import {
  eventDateKey,
  fromGoogleEvent,
  getEventsForDay,
  getWeekDays,
  getWeekRange,
  isLive,
  nextLiveChange,
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
});

describe("isLive", () => {
  const event = fromGoogleEvent(googleEvent());

  it("is live from the start up to, not including, the end", () => {
    expect(isLive(event, Date.parse("2026-10-27T08:59:59Z"))).toBe(false);
    expect(isLive(event, Date.parse("2026-10-27T09:00:00Z"))).toBe(true);
    expect(isLive(event, Date.parse("2026-10-27T09:29:59Z"))).toBe(true);
    expect(isLive(event, Date.parse("2026-10-27T09:30:00Z"))).toBe(false);
  });

  it("never marks an all-day event live", () => {
    const allDay = fromGoogleEvent(
      googleEvent({ allDay: true, start: "2026-10-27", end: "2026-10-28" }),
    );

    expect(isLive(allDay, new Date(2026, 9, 27, 12).getTime())).toBe(false);
  });
});

describe("nextLiveChange", () => {
  const events = [
    fromGoogleEvent(googleEvent()),
    fromGoogleEvent(
      googleEvent({
        id: "e2",
        start: "2026-10-27T12:00:00Z",
        end: "2026-10-27T13:00:00Z",
      }),
    ),
    fromGoogleEvent(
      googleEvent({ allDay: true, start: "2026-10-27", end: "2026-10-28" }),
    ),
  ];

  it("is the soonest start or end still to come", () => {
    expect(nextLiveChange(events, Date.parse("2026-10-27T08:00:00Z"))).toBe(
      Date.parse("2026-10-27T09:00:00Z"),
    );
    expect(nextLiveChange(events, Date.parse("2026-10-27T09:10:00Z"))).toBe(
      Date.parse("2026-10-27T09:30:00Z"),
    );
  });

  it("is undefined once everything has ended, ignoring all-day events", () => {
    expect(
      nextLiveChange(events, Date.parse("2026-10-27T14:00:00Z")),
    ).toBeUndefined();
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
