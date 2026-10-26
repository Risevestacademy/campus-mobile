import { Text } from "@shared/components/atoms";
import { cn } from "@shared/utils/style";
import { Pressable, View } from "react-native";

import type { WeekDay } from "../helpers";

type WeekStripProps = {
  days: WeekDay[];
  selectedKey: string;
  eventKeys: Set<string>;
  onSelect: (key: string) => void;
};

export function WeekStrip({
  days,
  selectedKey,
  eventKeys,
  onSelect,
}: WeekStripProps) {
  return (
    <View className="flex-row gap-1">
      {days.map((d) => {
        const selected = d.key === selectedKey;
        const hasEvents = eventKeys.has(d.key);

        return (
          <Pressable
            key={d.key}
            onPress={() => onSelect(d.key)}
            // accessibilityRole="button"
            // accessibilityState={{ selected }}
            // accessibilityLabel={d.date.toLocaleDateString("en-GB", {
            //   weekday: "long",
            //   day: "numeric",
            //   month: "long",
            // })}
            className={cn(
              "flex-1 items-center gap-1 rounded-lg py-2",
              selected ? "bg-ice-50" : "bg-overlay-white-10",
            )}
          >
            <Text
              variant="caption"
              className={selected ? "text-text-link-inverse" : "text-text-rail"}
            >
              {d.letter}
            </Text>
            <Text
              variant="label"
              className={cn(
                "font-label",
                selected ? "text-text-link-inverse" : "text-text-on-dark",
              )}
            >
              {d.day}
            </Text>
            <View
              className={cn(
                "size-1.5 rounded-full",
                hasEvents ? "bg-action-accent" : "bg-action-primary",
              )}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
