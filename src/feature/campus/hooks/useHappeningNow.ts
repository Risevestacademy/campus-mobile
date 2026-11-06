import { CalendarService, type GoogleCalendarEvent } from "@services/calendar";
import { useQuery } from "@tanstack/react-query";
import React from "react";

import type { LiveMeetingItem } from "../types";

const MINUTE = 60_000;

/** Midnight today to midnight tomorrow. */
function todayWindow() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate() + 1,
  );
  return { from: start.toISOString(), to: end.toISOString() };
}

/** Started and not yet over. All-day events don't count as happening now. */
function isOnNow(event: GoogleCalendarEvent, now: number) {
  if (event.allDay) return false;
  return Date.parse(event.start) <= now && now < Date.parse(event.end);
}

/** The current time, moved on once a minute. */
function useMinuteClock() {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), MINUTE);
    return () => clearInterval(timer);
  }, []);
  return now;
}

/**
 * Today's calendar events that are on right now. Empty without a connected
 * calendar. Shares the calendar tab's cache, so connecting or disconnecting
 * there updates this too.
 */
export function useHappeningNow(): LiveMeetingItem[] {
  const [range] = React.useState(todayWindow);
  const now = useMinuteClock();
  const { data } = useQuery({
    // The calendar feature's key, so both read one cache entry.
    queryKey: ["calendar", "events", range.from, range.to],
    queryFn: () => CalendarService.getEvents(range),
  });

  return React.useMemo(
    () =>
      data?.connected
        ? data.events
            .filter((event) => isOnNow(event, now))
            .map((event) => ({
              id: event.id,
              title: event.title ?? "(No title)",
              location: event.location ?? "",
              startsAt: event.start,
            }))
        : [],
    [data, now],
  );
}
