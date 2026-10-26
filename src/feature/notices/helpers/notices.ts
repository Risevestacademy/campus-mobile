import type { Notice, NoticeFilter } from "../types";

const DAY_MS = 24 * 60 * 60 * 1000;

export function isExpired(notice: Notice, now = new Date()) {
  const end = notice.endsAt ?? notice.dueAt ?? notice.startsAt;
  return end ? new Date(end).getTime() < now.getTime() : false;
}

export function matchesFilter(notice: Notice, filter: NoticeFilter) {
  switch (filter) {
    case "pinned":
      return notice.pinned;
    case "deadlines":
      return notice.kind === "deadline";
    case "events":
      return notice.kind === "event";
    default:
      return true;
  }
}

export function formatTime(iso: string) {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function formatDayParts(iso: string) {
  const d = new Date(iso);
  return {
    weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
    day: String(d.getDate()),
  };
}

export function formatDaysLeft(iso: string, now = new Date()) {
  const days = Math.ceil((new Date(iso).getTime() - now.getTime()) / DAY_MS);
  if (days <= 0) return "DUE TODAY";
  return `${days} ${days === 1 ? "DAY" : "DAYS"} LEFT`;
}
