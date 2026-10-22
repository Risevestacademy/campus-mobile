import { Back } from "@shared/components";
import { Pill, Row, Text, TextField } from "@shared/components/atoms";
import SafeArea from "@shared/components/safearea/SafeArea";
import { Search } from "lucide-react-native";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { withUniwind } from "uniwind";

import { Space, SpacesListView } from "../components";

const StyledSearch = withUniwind(Search);

type FilterSlug = "all" | "live" | "available" | "occupied" | "open" | "quiet";

const LABELS: { text: string; slug: FilterSlug }[] = [
  { text: "All", slug: "all" },
  { text: "Live now", slug: "live" },
  { text: "Available", slug: "available" },
  { text: "Has people", slug: "occupied" },
  { text: "Open", slug: "open" },
  { text: "Quiet", slug: "quiet" },
] as const;

export const MOCK_SPACES: Space[] = [
  // Classrooms
  {
    type: "classroom",
    title: "Calculus II",
    subtitle: "Room 204 · Prof. Martinez",
    participants: 28,
    status: "live",
  },
  {
    type: "classroom",
    title: "Intro to Psychology",
    subtitle: "Lecture Hall B · Dr. Chen",
    participants: 112,
    status: "live",
  },
  {
    type: "classroom",
    title: "Organic Chemistry Lab",
    subtitle: "Science Wing 3",
    participants: 0,
    status: "available",
  },
  {
    type: "classroom",
    title: "World History",
    subtitle: "Room 118 · Ms. Okafor",
    participants: 6,
    status: "quiet",
  },

  // Private
  {
    type: "private",
    title: "Study Pod 1",
    subtitle: "Library, 2nd floor",
    participants: 3,
    status: "live",
  },
  {
    type: "private",
    title: "Study Pod 4",
    subtitle: "Library, 2nd floor",
    participants: 0,
    status: "available",
  },
  {
    type: "private",
    title: "Group Room C",
    subtitle: "Student Center",
    participants: 5,
    status: "quiet",
  },

  // Common
  {
    type: "common",
    title: "Main Lounge",
    subtitle: "Student Center, ground floor",
    participants: 41,
    status: "open",
  },
  {
    type: "common",
    title: "Courtyard",
    subtitle: "Outdoor seating",
    participants: 17,
    status: "open",
  },
  {
    type: "common",
    title: "Reading Room",
    subtitle: "Library, 3rd floor",
    participants: 9,
    status: "quiet",
  },
];

function matchesFilter(space: Space, filter: FilterSlug) {
  switch (filter) {
    case "all":
      return true;
    case "occupied":
      return space.participants > 0;
    default:
      return space.status === filter;
  }
}

export function SpacesScreen() {
  const [selectedFilter, setSelectedFilter] = React.useState<FilterSlug>("all");
  const [query, setQuery] = React.useState("");

  const spaces = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_SPACES.filter(
      (space) =>
        matchesFilter(space, selectedFilter) &&
        (q === "" ||
          space.title.toLowerCase().includes(q) ||
          space.subtitle.toLowerCase().includes(q)),
    );
  }, [selectedFilter, query]);

  const totalPeople = MOCK_SPACES.reduce((sum, s) => sum + s.participants, 0);

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
              {MOCK_SPACES.length} spaces · {totalPeople} people on campus
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
      <SpacesListView data={spaces} />
    </SafeArea>
  );
}
