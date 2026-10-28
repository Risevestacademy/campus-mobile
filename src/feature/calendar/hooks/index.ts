import { type CalendarEventsQuery, CalendarService } from "@services/calendar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export * from "./useDayEvents";
export * from "./useWeekEvents";

const calendarKeys = {
  all: ["calendar"] as const,
  events: (query: CalendarEventsQuery) =>
    [...calendarKeys.all, "events", query.from, query.to] as const,
};

/**
 * Google Calendar events in a window. `data.connected` is false when the
 * member hasn't connected a calendar, or Google withdrew access.
 */
export function useCalendarEvents(
  query: CalendarEventsQuery = {},
  { enabled = true }: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: calendarKeys.events(query),
    queryFn: () => CalendarService.getEvents(query),
    enabled,
  });
}

export function useConnectCalendar() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: CalendarService.connect,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: calendarKeys.all }),
  });

  return { connectCalendar: mutateAsync, isConnecting: isPending };
}

export function useDisconnectCalendar() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: CalendarService.disconnect,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: calendarKeys.all }),
  });

  return { disconnectCalendar: mutateAsync, isDisconnecting: isPending };
}
