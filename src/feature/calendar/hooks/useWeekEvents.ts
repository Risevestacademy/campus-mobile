import { toDateKey } from "../helpers";
import { MOCK_EVENTS } from "../mocks/calendar.mock";

const EVENT_KEYS = new Set(
  MOCK_EVENTS.map((event) => toDateKey(new Date(event.start))),
);

// Date keys (YYYY-MM-DD) that have at least one event.
export function useWeekEventKeys() {
  return EVENT_KEYS;
}
