import { toDateKey } from "./toDateKey";

export type WeekDay = {
  key: string;
  date: Date;
  letter: string;
  day: number;
};

export function getWeekDays(reference: Date = new Date()): WeekDay[] {
  const offsetFromMonday = (reference.getDay() + 6) % 7;

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(
      reference.getFullYear(),
      reference.getMonth(),
      reference.getDate() - offsetFromMonday + i,
    );

    return {
      key: toDateKey(date),
      date,
      letter: date
        .toLocaleDateString("en-GB", { weekday: "narrow" })
        .toUpperCase(),
      day: date.getDate(),
    };
  });
}
