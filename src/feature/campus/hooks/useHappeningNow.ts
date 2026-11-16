import { CalendarService, type GoogleCalendarEvent } from "@services/calendar";
import { useMe } from "@shared/hooks/useMe";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { AppState } from "react-native";

import type { LiveMeetingItem, MeetingJoinTarget } from "../types";

const MINUTE = 60_000;

/** The local date `now` falls on, as a number that changes at midnight. */
function localDay(now: number) {
  const date = new Date(now);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

/** Midnight to midnight, local time, for the day starting at `dayStart`. */
function dayWindow(dayStart: number) {
  const start = new Date(dayStart);
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

/**
 * A room in your cohort's campus first, then a video call link. A room in
 * another cohort isn't on the map you're connected to, so it doesn't count.
 */
function joinTarget(
  event: GoogleCalendarEvent,
  cohortId: string | undefined,
): MeetingJoinTarget | null {
  const { room } = event;
  if (room && cohortId && room.cohortId === cohortId) {
    return {
      kind: "campus",
      code: room.code,
      spaceKey: room.spaceKey,
      spaceName: room.spaceName,
    };
  }
  if (event.meetingUrl) return { kind: "external", url: event.meetingUrl };
  return null;
}

/**
 * The current time, moved on once a minute and whenever the app comes back to
 * the foreground, since timers don't run in the background.
 */
function useMinuteClock() {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const tick = () => setNow(Date.now());
    const timer = setInterval(tick, MINUTE);
    const appState = AppState.addEventListener("change", (state) => {
      if (state === "active") tick();
    });
    return () => {
      clearInterval(timer);
      appState.remove();
    };
  }, []);
  return now;
}

/**
 * Today's calendar events that are on right now. Empty without a connected
 * calendar. Shares the calendar tab's cache, so connecting or disconnecting
 * there updates this too.
 */
export function useHappeningNow(): LiveMeetingItem[] {
  const { data: me } = useMe();
  const cohortId = me?.membership?.cohortId;
  const now = useMinuteClock();
  // A new day asks for that day's events.
  const day = localDay(now);
  const range = React.useMemo(() => dayWindow(day), [day]);
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
            .map((event) => {
              const join = joinTarget(event, cohortId);
              return {
                id: event.id,
                title: event.title ?? "(No title)",
                location:
                  join?.kind === "campus"
                    ? join.spaceName
                    : (event.location ?? ""),
                startsAt: event.start,
                join,
              };
            })
        : [],
    [data, now, cohortId],
  );
}
