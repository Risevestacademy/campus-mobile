import { Pill } from "@shared/components/atoms";
import { FlatList, Pressable } from "react-native";

import { SEARCH_FILTERS } from "../helpers";
import type { SearchFilter } from "../types";

/** The filter pills: solid brand for the active one, subtle for the rest. */
export function SearchFilters({
  selected,
  onSelect,
}: {
  selected: SearchFilter;
  onSelect: (filter: SearchFilter) => void;
}) {
  return (
    <FlatList
      horizontal
      data={SEARCH_FILTERS}
      keyExtractor={(item) => item.key}
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-4"
      // Pill height only; a horizontal list otherwise fills the screen.
      className="grow-0"
      renderItem={({ item }) => {
        const active = item.key === selected;
        return (
          <Pressable
            onPress={() => onSelect(item.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Pill
              color="brand"
              variant={active ? "solid" : "subtle"}
              label={item.label}
              size="lg"
            />
          </Pressable>
        );
      }}
    />
  );
}
