import { Pill, Text } from "@shared/components/atoms";
import { View } from "react-native";

import type { NoticeFilter } from "../types";
import { FilterChips } from "./FilterChips";

type NoticesHeaderProps = {
  newCount: number;
  filter: NoticeFilter;
  onFilterChange: (filter: NoticeFilter) => void;
};

export function NoticesHeader({
  newCount,
  filter,
  onFilterChange,
}: NoticesHeaderProps) {
  return (
    <View className="gap-1 px-6 pt-3 pb-5">
      <Text
        variant="overline"
        className="tracking-[1px] text-text-turquoise-bright"
      >
        Notice wall
      </Text>
      <View className="flex-row items-center gap-2">
        <Text variant="h1" className="text-text-on-dark">
          What’s new
        </Text>
        {newCount > 0 ? (
          <View>
            <Pill
              label={`${newCount} NEW`}
              className="bg-action-accent"
              labelClassName="text-text-on-accent"
            />
          </View>
        ) : null}
      </View>
      <View className="mt-3">
        <FilterChips value={filter} onChange={onFilterChange} />
      </View>
    </View>
  );
}
