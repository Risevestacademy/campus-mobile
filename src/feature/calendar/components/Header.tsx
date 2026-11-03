import { Text } from "@shared/components/atoms";
import { CalendarCheck2 } from "lucide-react-native";
import { View } from "react-native";

import { getTodayDate, type WeekDay } from "../helpers";
import { WeekStrip } from "./WeekStrip";

type CalendarHeaderProps = {
  days: WeekDay[];
  /** Days (YYYY-MM-DD) with at least one event. */
  eventKeys: Set<string>;
  /** Whether a Google Calendar is connected. */
  synced: boolean;
  selectedKey: string;
  onSelect: (key: string) => void;
};

export function CalendarHeader({
  days,
  eventKeys,
  synced,
  selectedKey,
  onSelect,
}: CalendarHeaderProps) {
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
      {synced ? (
        <View className="flex-row items-center gap-1 self-start rounded-full bg-overlay-white-15 px-3 py-1">
          <CalendarCheck2 width={14} height={14} color="#F7F7F7" />
          <Text variant="label" className="text-text-on-dark">
            Synced with Google Calendar
          </Text>
        </View>
      ) : null}

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
