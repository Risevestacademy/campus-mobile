import { Text } from "@shared/components/atoms";
import { CalendarCheck2 } from "lucide-react-native";
import { useMemo } from "react";
import { View } from "react-native";

import { getTodayDate, getWeekDays } from "../helpers";
import { useWeekEventKeys } from "../hooks";
import { WeekStrip } from "./WeekStrip";

type CalendarHeaderProps = {
  selectedKey: string;
  onSelect: (key: string) => void;
};

export function CalendarHeader({ selectedKey, onSelect }: CalendarHeaderProps) {
  const days = useMemo(() => getWeekDays(), []);
  const eventKeys = useWeekEventKeys();

  return (
    <View className="gap-1 px-6 pt-4 pb-5">
      <Text
        variant={"overline"}
        className="tracking-[1px] text-text-turquoise-fixed"
      >
        {getTodayDate()}
      </Text>
      <Text variant={"h1"} className="text-text-on-dark">
        Your week
      </Text>
      <View className="flex-row items-center gap-1 self-start rounded-full bg-overlay-white-15 px-3 py-1">
        <CalendarCheck2 width={14} height={14} color="#F7F7F7" />
        <Text variant="label" className="text-text-on-dark">
          Synced with Google Calendar
        </Text>
      </View>

      <View className="mt-3">
        <WeekStrip
          days={days}
          selectedKey={selectedKey}
          eventKeys={eventKeys}
          onSelect={onSelect}
        />
      </View>
    </View>
  );
}
