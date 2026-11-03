import { client } from "@core/api";
import { unwrap } from "@core/api/error";
import { components, paths } from "@core/api/generated/schema";

export type CalendarEventsResponse =
  paths["/v1/calendar/events"]["get"]["responses"]["200"]["content"]["application/json"];

export type CalendarEventsQuery = NonNullable<
  paths["/v1/calendar/events"]["get"]["parameters"]["query"]
>;

export type GoogleCalendarEvent = components["schemas"]["CalendarEventDto"];

export class CalendarService {
  static async getEvents(
    query: CalendarEventsQuery = {},
  ): Promise<CalendarEventsResponse> {
    return unwrap<CalendarEventsResponse>(
      client.GET("/v1/calendar/events", { params: { query } }),
    );
  }

  static async connect(serverAuthCode: string): Promise<void> {
    await unwrap(
      client.POST("/v1/calendar/connect", { body: { serverAuthCode } }),
    );
  }

  static async disconnect(): Promise<void> {
    await unwrap(client.DELETE("/v1/calendar"));
  }
}
