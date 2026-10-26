import { Text } from "@shared/components/atoms";
import { cn } from "@shared/utils/style";
import { Pressable, View } from "react-native";

import type { NoticeFilter } from "../types";

const FILTERS: { value: NoticeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pinned", label: "Pinned" },
  { value: "deadlines", label: "Deadlines" },
  { value: "events", label: "Events" },
];

type FilterChipsProps = {
  value: NoticeFilter;
  onChange: (filter: NoticeFilter) => void;
};

export function FilterChips({ value, onChange }: FilterChipsProps) {
  return (
    <View className="flex-row gap-2">
      {FILTERS.map((f) => {
        const active = f.value === value;
        return (
          <Pressable
            key={f.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(f.value)}
            className={cn(
              "rounded-full px-3 py-1",
              active ? "bg-action-accent" : "bg-overlay-white-10",
            )}
          >
            <Text
              variant="label"
              className={active ? "text-text-on-accent" : "text-text-on-dark"}
            >
              {f.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
