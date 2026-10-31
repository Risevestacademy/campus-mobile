import type { CalendarEvent } from "../types";
import { eventDateKey } from "./fromGoogleEvent";

/** All-day events first, then by start time. */
export function getEventsForDay(events: CalendarEvent[], key: string) {
  return events
    .filter((event) => eventDateKey(event) === key)
    .sort((a, b) => {
      if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });
}
