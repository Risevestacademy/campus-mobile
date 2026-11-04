export type CalendarEventKind = "class" | "mentor" | "broadcast";

export type CalendarEvent = {
  id: string;
  title: string;
  /** A timestamp, or a bare date (`2026-10-27`) for an all-day event. */
  start: string;
  end: string;
  location: string;
  recurrence?: string;
  /** Campus's own kinds; Google events have none and use the default look. */
  kind?: CalendarEventKind;
  allDay?: boolean;
  meetingUrl?: string | null;
  live?: boolean;
};
