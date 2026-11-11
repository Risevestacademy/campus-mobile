import { LiveIndicator } from "@shared/components";
import { Card, Row, Text } from "@shared/components/atoms";
import { Armchair, Clock, ExternalLink, Plus, X } from "lucide-react-native";
import { Pressable, SectionList, View } from "react-native";
import { withUniwind } from "uniwind";

import { searchHomeKey } from "../helpers";
import type {
  LiveMeetingItem,
  QuickAction,
  SearchHomeItem,
  SearchHomeSection,
} from "../types";

const StyledClock = withUniwind(Clock);
const StyledExternalLink = withUniwind(ExternalLink);
const StyledX = withUniwind(X);

const ACTION_ICONS = {
  newMeeting: withUniwind(Plus),
  myDesk: withUniwind(Armchair),
  classroom: withUniwind(ExternalLink),
} satisfies Record<QuickAction["key"], unknown>;

type SearchHomeProps = {
  sections: SearchHomeSection[];
  onOpenMeeting: (meeting: LiveMeetingItem) => void;
  onSearch: (query: string) => void;
  onRemoveRecent: (query: string) => void;
  onClearRecent: () => void;
  onAction: (action: QuickAction) => void;
};

export function SearchHome({ sections, ...handlers }: SearchHomeProps) {
  return (
    <SectionList
      sections={sections}
      keyExtractor={searchHomeKey}
      renderItem={({ item }) => <SearchHomeRow item={item} {...handlers} />}
      renderSectionHeader={({ section }) => (
        <Row className="px-4 pt-2 pb-1" align="end" justify="between">
          <Text variant="overline" color="secondary">
            {section.title}
          </Text>
          {section.key === "recent" ? (
            <Pressable
              onPress={handlers.onClearRecent}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Clear recent searches"
            >
              <Text variant="caption" color="link">
                Clear
              </Text>
            </Pressable>
          ) : null}
        </Row>
      )}
      stickySectionHeadersEnabled
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerClassName="pb-6"
    />
  );
}

function SearchHomeRow({
  item,
  onOpenMeeting,
  onSearch,
  onRemoveRecent,
  onAction,
}: { item: SearchHomeItem } & Omit<SearchHomeProps, "sections">) {
  switch (item.type) {
    case "live":
      return <LiveMeetingRow meeting={item.data} onOpen={onOpenMeeting} />;
    case "recent":
      return (
        <Pressable
          onPress={() => onSearch(item.data.query)}
          accessibilityRole="button"
          accessibilityLabel={`Search for ${item.data.query}`}
          className="flex-row items-center gap-3 px-4 py-3 active:bg-bg-hover"
        >
          <StyledClock size={16} colorClassName="accent-text-muted" />
          <Text variant="body-sm" className="flex-1">
            {item.data.query}
          </Text>
          <Pressable
            onPress={() => onRemoveRecent(item.data.query)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${item.data.query} from recent searches`}
          >
            <StyledX size={16} colorClassName="accent-text-muted" />
          </Pressable>
        </Pressable>
      );
    case "actions":
      return (
        <View className="flex-row gap-3 px-4 py-2">
          {item.data.map((action) => {
            const Icon = ACTION_ICONS[action.key];
            return (
              <Card
                key={action.key}
                onPress={() => onAction(action)}
                accessibilityRole="button"
                className="flex-1 items-center gap-1 rounded-xl border border-border-default bg-bg-card px-2 py-3 active:bg-bg-hover"
              >
                <Icon size={20} colorClassName="accent-text-primary" />
                <Text variant="label" className="text-center" numberOfLines={1}>
                  {action.label}
                </Text>
              </Card>
            );
          })}
        </View>
      );
  }
}

/** Tappable only when there's somewhere to join it. */
function LiveMeetingRow({
  meeting,
  onOpen,
}: {
  meeting: LiveMeetingItem;
  onOpen: (meeting: LiveMeetingItem) => void;
}) {
  const { join } = meeting;
  return (
    <Pressable
      onPress={() => onOpen(meeting)}
      disabled={!join}
      accessibilityRole={join?.kind === "external" ? "link" : "button"}
      accessibilityLabel={`${meeting.title}, live now`}
      className="flex-row items-center gap-3 px-4 py-3 active:bg-bg-hover"
    >
      <View className="flex-1 gap-0.5">
        <Text variant="label">{meeting.title}</Text>
        {meeting.location ? (
          <Text variant="caption" color="secondary">
            {meeting.location}
          </Text>
        ) : null}
      </View>
      <LiveIndicator />
      {join?.kind === "external" ? (
        <StyledExternalLink size={16} colorClassName="accent-text-muted" />
      ) : null}
    </Pressable>
  );
}
