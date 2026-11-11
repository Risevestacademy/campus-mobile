import { useHappeningNow } from "@features/campus/hooks/useHappeningNow";
import { CalendarService } from "@services/calendar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import React from "react";

jest.mock("@shared/hooks/useMe", () => ({
  useMe: () => ({ data: { membership: { cohortId: "cohort-1" } } }),
}));

type Events = Awaited<ReturnType<typeof CalendarService.getEvents>>;

const localMidnight = (year: number, month: number, day: number) =>
  new Date(year, month, day).toISOString();

function renderHappeningNow() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  return renderHook(() => useHappeningNow(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

describe("useHappeningNow", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("asks for the new day's events once midnight passes", async () => {
    jest.setSystemTime(new Date(2026, 10, 9, 23, 59, 30));
    const getEvents = jest.spyOn(CalendarService, "getEvents");
    getEvents.mockImplementation(async ({ from } = {}) => {
      const tomorrow = from === localMidnight(2026, 10, 10);
      return {
        connected: true,
        truncated: false,
        events: tomorrow
          ? [
              {
                id: "early",
                title: "Early sync",
                start: new Date(2026, 10, 10, 0, 0).toISOString(),
                end: new Date(2026, 10, 10, 1, 0).toISOString(),
                allDay: false,
                status: "confirmed",
                response: "accepted",
                location: null,
                meetingUrl: "https://meet.example.com/early",
                url: null,
                room: null,
              },
            ]
          : [],
      } as Events;
    });

    const { result } = await renderHappeningNow();
    // React Query answers through promises and zero-delay timers.
    await act(() => jest.advanceTimersByTimeAsync(0));

    expect(getEvents).toHaveBeenLastCalledWith({
      from: localMidnight(2026, 10, 9),
      to: localMidnight(2026, 10, 10),
    });
    expect(result.current).toEqual([]);

    await act(() => jest.advanceTimersByTimeAsync(60_000));
    // The new day's answer is handed over a tick later.
    await act(() => jest.advanceTimersByTimeAsync(0));

    expect(getEvents).toHaveBeenLastCalledWith({
      from: localMidnight(2026, 10, 10),
      to: localMidnight(2026, 10, 11),
    });
    expect(result.current.map((meeting) => meeting.title)).toEqual([
      "Early sync",
    ]);
  });
});
