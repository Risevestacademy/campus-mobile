import type { CalendarEvent } from "../types";
import { toDateKey } from "./toDateKey";

export function getEventsForDay(events: CalendarEvent[], key: string) {
  return events
    .filter((event) => toDateKey(new Date(event.start)) === key)
    .sort((a, b) => a.start.localeCompare(b.start));
}
