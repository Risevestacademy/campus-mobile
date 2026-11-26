import { Back } from "@shared/components";
import { Pill, Row, Spinner, Text, TextField } from "@shared/components/atoms";
import SafeArea from "@shared/components/safearea/SafeArea";
import { useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { withUniwind } from "uniwind";

import { SpacesListView } from "../components";
import { matchesSpace } from "../helpers";
import { useCampusSpaces } from "../hooks";
import type { Space, SpaceFilter } from "../types";

const StyledSearch = withUniwind(Search);

// Live from your calendar; people and locks from world.
const LABELS: { text: string; slug: SpaceFilter }[] = [
  { text: "All", slug: "all" },
  { text: "Live now", slug: "live" },
  { text: "Has people", slug: "occupied" },
  { text: "Empty", slug: "empty" },
  { text: "Locked", slug: "locked" },
];

function peopleLabel(count: number) {
  return count === 1 ? "1 person" : `${count} people`;
}

export function SpacesScreen() {
  const router = useRouter();
  const { ready, spaces, people } = useCampusSpaces();
  const [selectedFilter, setSelectedFilter] =
    React.useState<SpaceFilter>("all");
  const [query, setQuery] = React.useState("");

  const shown = React.useMemo(
    () => spaces.filter((space) => matchesSpace(space, selectedFilter, query)),
    [spaces, selectedFilter, query],
  );

  const openSpace = (space: Space) =>
    router.push({
      pathname: "/(app)/space/[id]",
      params: { id: space.key },
    });

  const empty = !ready ? (
    <View className="items-center gap-2 py-10">
      <Spinner size={20} />
      <Text variant="caption" color="muted">
        Campus is loading…
      </Text>
    </View>
  ) : (
    <Text variant="caption" color="muted" className="py-10 text-center">
      {spaces.length === 0
        ? "There are no spaces on this map yet."
        : "No spaces match."}
    </Text>
  );

  return (
    <SafeArea edges={[]} className="flex-1 px-0">
      <View className="gap-3 bg-bg-band pt-safe-offset-4 pb-4">
        <Row className="mx-6" gap="md">
          <Back />
          <View className="gap-1">
            <Text variant="h4" className="text-action-accent">
              All spaces
            </Text>
            <Text variant="caption" className="text-text-on-dark">
              {ready
                ? `${spaces.length} spaces · ${peopleLabel(people)} in them`
                : "Loading campus…"}
            </Text>
          </View>
        </Row>
        <TextField
          value={query}
          onChangeText={setQuery}
          placeholder="Search spaces or people"
          prefix={<StyledSearch size={18} colorClassName="accent-text-muted" />}
          inputContainerClassName="rounded-full bg-bg-card border-0 mx-6"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-6"
        >
          {LABELS.map((label) => (
            <TouchableOpacity
              key={label.slug}
              onPress={() => setSelectedFilter(label.slug)}
              accessibilityRole="tab"
              accessibilityState={{ selected: selectedFilter === label.slug }}
            >
              <Pill
                variant={selectedFilter === label.slug ? "solid" : "subtle"}
                color="brand"
                label={label.text}
                className="px-3 py-1"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <SpacesListView data={shown} onOpenSpace={openSpace} empty={empty} />
    </SafeArea>
  );
}
