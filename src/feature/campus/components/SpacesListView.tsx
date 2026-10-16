import { Card, Divider, Row, Text } from "@shared/components/atoms";
import { ChevronRight, DoorClosed, User } from "lucide-react-native";
import React from "react";
import { FlatList, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledChevronRight = withUniwind(ChevronRight);
const StyledUser = withUniwind(User);
const StyledDoorClosed = withUniwind(DoorClosed);

const SECTION_CONFIG: Record<
  SpaceType,
  { title: string; colorClassname: string }
> = {
  classroom: { title: "Classrooms", colorClassname: "bg-identity-sky-strong" },
  private: { title: "Private", colorClassname: "bg-identity-violet" },
  common: { title: "Common", colorClassname: "bg-action-accent" },
};

const SECTION_ORDER: SpaceType[] = ["classroom", "private", "common"];

type Section = { type: SpaceType; spaces: Space[] };

type SpaceType = "classroom" | "private" | "common";

export type Space = {
  participants: number;
  title: string;
  subtitle: string;
  status: "live" | "available" | "open" | "quiet";
  type: SpaceType;
};

type SpacesListViewProps = {
  data: Space[];
};

type SpaceSeperatedCardProps = {
  colorClassname: string;
  title: string;
  spaces: Space[];
};

function SpaceSeperatedCard({
  colorClassname,
  title,
  spaces,
}: SpaceSeperatedCardProps) {
  return (
    <View className="gap-3">
      <Row>
        <View className={`size-2 rounded-full ${colorClassname}`} />
        <Text variant="overline" color="secondary">
          {title}
        </Text>
        <Text color="muted" variant="caption">
          {spaces.length}
        </Text>
      </Row>
      <Card className="border border-border-default p-0">
        <FlatList
          scrollEnabled={false}
          ItemSeparatorComponent={
            <Divider dividerBgClassName="bg-border-default" />
          }
          data={spaces}
          renderItem={({ item: e, index: i }) => (
            <Row key={i} className="px-4 py-3">
              <View className={`${colorClassname} h-9 w-1 rounded-full`} />
              <View className="flex-1 gap-0.5">
                <Row>
                  <Text variant="label">{e.title}</Text>
                </Row>
                <Text variant="caption" color="secondary">
                  {e.subtitle}
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <StyledUser size={14} colorClassName="accent-text-muted" />
                <Text variant="label" color="secondary">
                  {e.participants}
                </Text>
              </View>
              <StyledChevronRight
                colorClassName="accent-text-muted"
                size={16}
              />
            </Row>
          )}
        />
      </Card>
    </View>
  );
}

export function SpacesListView({ data }: SpacesListViewProps) {
  const sections = React.useMemo<Section[]>(() => {
    const grouped: Record<SpaceType, Space[]> = {
      classroom: [],
      private: [],
      common: [],
    };

    for (const space of data) {
      grouped[space.type].push(space);
    }

    return SECTION_ORDER.map((type) => ({
      type,
      spaces: grouped[type],
    })).filter((section) => section.spaces.length > 0);
  }, [data]);

  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      data={sections}
      className="px-5 py-4"
      contentContainerClassName="pb-10"
      ListEmptyComponent={() => <View></View>}
      ItemSeparatorComponent={<View className="h-3" />}
      ListFooterComponentClassName="mt-4"
      ListFooterComponent={
        <Row>
          <StyledDoorClosed colorClassName="accent-text-muted" size={14} />
          <Text variant="caption" color="muted">
            Tap a free room to start or schedule a meeting
          </Text>
        </Row>
      }
      renderItem={({ item, index }) => {
        return (
          <SpaceSeperatedCard
            key={index}
            title={SECTION_CONFIG[item.type].title}
            colorClassname={SECTION_CONFIG[item.type].colorClassname}
            spaces={item.spaces}
          />
        );
      }}
    />
  );
}
