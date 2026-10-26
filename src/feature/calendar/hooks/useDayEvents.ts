import { getEventsForDay } from "../helpers";
import { MOCK_EVENTS } from "../mocks/calendar.mock";

export function useDayEvents(key: string) {
  return getEventsForDay(MOCK_EVENTS, key);
}
