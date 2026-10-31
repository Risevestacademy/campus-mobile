import { type CalendarEventsQuery, CalendarService } from "@services/calendar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { requestCalendarAuthCode } from "../helpers/requestCalendarAuthCode";

export * from "./useLiveEvents";

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

/**
 * The whole connect flow: Google's consent for read-only calendar access,
 * then handing the auth code to the API. `connect` resolves false when the
 * member backs out of Google's screens.
 */
export function useConnectGoogleCalendar() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async () => {
      const serverAuthCode = await requestCalendarAuthCode();
      if (!serverAuthCode) return false;
      await CalendarService.connect(serverAuthCode);
      return true;
    },
    onSuccess: (connected) => {
      if (connected) {
        return queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      }
    },
  });

  return { connect: mutateAsync, isConnecting: isPending };
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
