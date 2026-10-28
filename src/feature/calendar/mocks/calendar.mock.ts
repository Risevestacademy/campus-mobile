import type { CalendarEvent } from "../types";

function at(offsetDays: number, hour: number, minute = 0) {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + offsetDays,
    hour,
    minute,
  ).toISOString();
}

export const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    title: "Design Foundations",
    start: at(0, 14),
    end: at(0, 15),
    location: "Classroom A · Chiemezie",
    kind: "class",
    live: true,
  },
  {
    id: "2",
    title: "Front-end: Layout systems",
    start: at(0, 16),
    end: at(0, 17),
    location: "Classroom B",
    recurrence: "every Thursday",
    kind: "class",
  },
  {
    id: "3",
    title: "Mentor pod with Chiemezie",
    start: at(0, 17, 30),
    end: at(0, 18),
    location: "Faculty Hallway",
    kind: "mentor",
  },
  {
    id: "4",
    title: "Town Hall",
    start: at(0, 18),
    end: at(0, 19),
    location: "Public Hall",
    recurrence: "broadcast",
    kind: "broadcast",
  },
  {
    id: "5",
    title: "Design review",
    start: at(-3, 10),
    end: at(-3, 11),
    location: "Classroom A",
    kind: "class",
  },
  {
    id: "6",
    title: "Workshop",
    start: at(-1, 14),
    end: at(-1, 15),
    location: "Classroom B",
    kind: "class",
  },
  {
    id: "7",
    title: "Mentor session",
    start: at(1, 16),
    end: at(1, 17),
    location: "Faculty Hallway",
    kind: "mentor",
  },
];

export const MOCK_ATTENDANCE_NOTE =
  "Slot reserved until we define what counts as “attended”.";
