import type { GoogleCalendarEvent } from "@services/calendar";

import type { CalendarEvent } from "../types";
import { toDateKey } from "./toDateKey";

/** Maps an event from the API onto what the calendar screen shows. */
export function fromGoogleEvent(
  event: GoogleCalendarEvent,
  now: Date = new Date(),
): CalendarEvent {
  const start = new Date(event.start).getTime();
  const end = new Date(event.end).getTime();

  return {
    id: event.id,
    title: event.title ?? "(No title)",
    start: event.start,
    end: event.end,
    location: event.location ?? "",
    allDay: event.allDay,
    meetingUrl: event.meetingUrl,
    live: !event.allDay && start <= now.getTime() && now.getTime() < end,
  };
}

/**
 * The day an event falls on. An all-day event's `start` is already a bare
 * date; reading it with `new Date` would make it midnight UTC, the day before
 * anywhere west of Greenwich.
 */
export function eventDateKey(event: Pick<CalendarEvent, "start" | "allDay">) {
  return event.allDay ? event.start : toDateKey(new Date(event.start));
}
