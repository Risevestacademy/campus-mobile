export type CalendarEventKind = "class" | "mentor" | "broadcast";

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  location: string;
  recurrence?: string;
  kind: CalendarEventKind;
  live?: boolean;
};
