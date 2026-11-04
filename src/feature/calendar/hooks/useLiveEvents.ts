import React from "react";
import { AppState } from "react-native";

import { isLive, nextLiveChange } from "../helpers/fromGoogleEvent";
import type { CalendarEvent } from "../types";

/**
 * The events with `live` set for the current time, kept current while the
 * screen is open: it re-checks when the next event starts or ends, and when
 * the app comes back to the foreground, where timers may not have run.
 */
export function useLiveEvents(events: CalendarEvent[]) {
  const [now, setNow] = React.useState(() => Date.now());
  const next = nextLiveChange(events, now);

  React.useEffect(() => {
    if (next === undefined) return;
    const timer = setTimeout(
      () => setNow(Date.now()),
      Math.max(next - Date.now(), 0),
    );
    return () => clearTimeout(timer);
  }, [next]);

  React.useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") setNow(Date.now());
    });
    return () => subscription.remove();
  }, []);

  return React.useMemo(
    () => events.map((event) => ({ ...event, live: isLive(event, now) })),
    [events, now],
  );
}
