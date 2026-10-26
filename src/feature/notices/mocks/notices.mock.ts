// MOCK DATA — delete this whole `mocks/` dir once the real API is wired up
// (see hooks/useNotices.ts, the only file that imports from here).
import type { Notice } from "../types";

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

export const MOCK_NOTICES: Notice[] = [
  {
    id: "1",
    kind: "deadline",
    title: "Portfolio case study is due Friday",
    subtitle: "Design Foundations · submit on the class page",
    pinned: true,
    isNew: true,
    postedAt: at(-1, 9),
    dueAt: at(2, 23, 59),
  },
  {
    id: "2",
    kind: "event",
    title: "Town Hall at 18:00",
    subtitle: "Public Hall · broadcast from the Rise team",
    pinned: true,
    isNew: true,
    postedAt: at(-1, 11),
    startsAt: at(2, 18),
  },
  {
    id: "3",
    kind: "resource",
    title: "3 new resources for Design Foundations",
    subtitle: "Resource Centre · Chiemezie",
    pinned: false,
    isNew: false,
    postedAt: at(0, 8),
  },
  {
    id: "4",
    kind: "announcement",
    title: "Project Studio closes early today",
    subtitle: "Posted by Admin",
    pinned: false,
    isNew: false,
    postedAt: at(0, 7),
    endsAt: at(0, 23, 59),
  },
  ...[1, 2, 3, 4].map((n): Notice => ({
    id: `expired-${n}`,
    kind: "announcement",
    title: `Past notice ${n}`,
    subtitle: "Posted by Admin",
    pinned: false,
    isNew: false,
    postedAt: at(-10 - n, 9),
    endsAt: at(-9 - n, 9),
  })),
];
