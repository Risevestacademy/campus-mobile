import { useLiveEvents } from "@features/calendar/hooks";
import type { CalendarEvent } from "@features/calendar/types";
import { act, renderHook } from "@testing-library/react-native";

const START = Date.parse("2026-10-27T09:00:00Z");
const END = Date.parse("2026-10-27T09:30:00Z");

const standup: CalendarEvent = {
  id: "e1",
  title: "Backend standup",
  start: new Date(START).toISOString(),
  end: new Date(END).toISOString(),
  location: "",
};

describe("useLiveEvents", () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: START - 60_000 });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("goes live when the event starts and stops when it ends", async () => {
    const events = [standup];
    const { result } = await renderHook(() => useLiveEvents(events));

    expect(result.current[0]?.live).toBe(false);

    await act(() => jest.advanceTimersByTime(60_000));
    expect(result.current[0]?.live).toBe(true);

    await act(() => jest.advanceTimersByTime(END - START));
    expect(result.current[0]?.live).toBe(false);
  });
});
