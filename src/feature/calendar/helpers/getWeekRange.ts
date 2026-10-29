import type { WeekDay } from "./getWeekDays";

/** The window to ask the API for: the first day's midnight to the day after the last. */
export function getWeekRange(days: WeekDay[]) {
  const first = days[0]?.date ?? new Date();
  const last = days[days.length - 1]?.date ?? first;
  const end = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
  return { from: first.toISOString(), to: end.toISOString() };
}
