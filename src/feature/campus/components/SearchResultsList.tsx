import { Text } from "@shared/components/atoms";
import { SectionList, View } from "react-native";

import { searchResultKey } from "../helpers";
import type { SearchSection } from "../types";
import { type SearchResultActions, SearchResultRow } from "./SearchResultRow";

export function SearchResultsList({
  sections,
  query,
  showHeaders,
  actions,
}: {
  sections: SearchSection[];
  showHeaders: boolean;
  query: string;
  actions?: SearchResultActions;
}) {
  return (
    <SectionList
      sections={sections}
      keyExtractor={searchResultKey}
      renderItem={({ item }) => (
        <SearchResultRow result={item} actions={actions} />
      )}
      ItemSeparatorComponent={() => <View className="h-2" />}
      renderSectionHeader={
        showHeaders
          ? ({ section }) => (
              <Text
                variant="overline"
                color="secondary"
                className="bg-bg-page px-4 pt-4 pb-2"
              >
                {section.title}
                {" · "}
                {section.data.length}
              </Text>
            )
          : () => <View className="h-4" />
      }
      stickySectionHeadersEnabled
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerClassName="pb-6"
      ListEmptyComponent={
        <Text color="secondary" className="px-4 pt-6 text-center">
          {query.trim() ? `No results for “${query.trim()}”` : "No results"}
        </Text>
      }
    />
  );
}
