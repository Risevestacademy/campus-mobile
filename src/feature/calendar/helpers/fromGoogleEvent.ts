import type { GoogleCalendarEvent } from "@services/calendar";

import type { CalendarEvent } from "../types";
import { toDateKey } from "./toDateKey";

/**
 * Maps an event from the API onto what the calendar screen shows. Whether it
 * is live depends on the time, so `useLiveEvents` adds that.
 */
export function fromGoogleEvent(event: GoogleCalendarEvent): CalendarEvent {
  return {
    id: event.id,
    title: event.title ?? "(No title)",
    start: event.start,
    end: event.end,
    location: event.location ?? "",
    allDay: event.allDay,
    meetingUrl: event.meetingUrl,
  };
}

/** Running at `now`. All-day events are never live. */
export function isLive(
  event: Pick<CalendarEvent, "start" | "end" | "allDay">,
  now: number,
) {
  if (event.allDay) return false;
  return (
    new Date(event.start).getTime() <= now &&
    now < new Date(event.end).getTime()
  );
}

/** The next moment any event starts or ends after `now`, if there is one. */
export function nextLiveChange(
  events: Pick<CalendarEvent, "start" | "end" | "allDay">[],
  now: number,
): number | undefined {
  let next: number | undefined;
  for (const event of events) {
    if (event.allDay) continue;
    for (const time of [
      new Date(event.start).getTime(),
      new Date(event.end).getTime(),
    ]) {
      if (time > now && (next === undefined || time < next)) next = time;
    }
  }
  return next;
}

/**
 * The day an event falls on. An all-day event's `start` is already a bare
 * date; reading it with `new Date` would make it midnight UTC, the day before
 * anywhere west of Greenwich.
 */
export function eventDateKey(event: Pick<CalendarEvent, "start" | "allDay">) {
  return event.allDay ? event.start : toDateKey(new Date(event.start));
}
