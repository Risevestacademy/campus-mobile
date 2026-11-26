import { Divider, Row, Text } from "@shared/components/atoms";
import { cn } from "@shared/utils/style";
import { ChevronRight, DoorClosed, User } from "lucide-react-native";
import React from "react";
import { SectionList, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledChevronRight = withUniwind(ChevronRight);
const StyledUser = withUniwind(User);
const StyledDoorClosed = withUniwind(DoorClosed);

type SpaceType = "classroom" | "private" | "common";

export type Space = {
  participants: number;
  title: string;
  subtitle: string;
  status: "live" | "available" | "open" | "quiet";
  type: SpaceType;
};

const SECTION_CONFIG: Record<
  SpaceType,
  { title: string; colorClassname: string }
> = {
  classroom: { title: "Classrooms", colorClassname: "bg-identity-sky-strong" },
  private: { title: "Private", colorClassname: "bg-identity-violet" },
  common: { title: "Common", colorClassname: "bg-action-accent" },
};

const SECTION_ORDER: SpaceType[] = ["classroom", "private", "common"];

type SpaceSection = {
  type: SpaceType;
  title: string;
  colorClassname: string;
  data: Space[];
};

type SpacesListViewProps = {
  data: Space[];
};

/** Groups spaces by type, in section order, leaving out empty groups. */
export function toSpaceSections(spaces: Space[]): SpaceSection[] {
  const grouped: Record<SpaceType, Space[]> = {
    classroom: [],
    private: [],
    common: [],
  };
  for (const space of spaces) grouped[space.type].push(space);

  return SECTION_ORDER.map((type) => ({
    type,
    ...SECTION_CONFIG[type],
    data: grouped[type],
  })).filter((section) => section.data.length > 0);
}

function SectionHeader({ section }: { section: SpaceSection }) {
  return (
    <Row className="pb-3">
      <View className={cn("size-2 rounded-full", section.colorClassname)} />
      <Text variant="overline" color="secondary">
        {section.title}
      </Text>
      <Text color="muted" variant="caption">
        {section.data.length}
      </Text>
    </Row>
  );
}

function SpaceRow({
  space,
  colorClassname,
  first,
  last,
}: {
  space: Space;
  colorClassname: string;
  first: boolean;
  last: boolean;
}) {
  return (
    <Row
      className={cn(
        "border-x border-border-default bg-bg-card px-4 py-3",
        first && "rounded-t-xl border-t",
        last && "rounded-b-xl border-b",
      )}
    >
      <View className={cn("h-9 w-1 rounded-full", colorClassname)} />
      <View className="flex-1 gap-0.5">
        <Text variant="label">{space.title}</Text>
        <Text variant="caption" color="secondary">
          {space.subtitle}
        </Text>
      </View>
      <View className="flex-row items-center gap-1">
        <StyledUser size={14} colorClassName="accent-text-muted" />
        <Text variant="label" color="secondary">
          {space.participants}
        </Text>
      </View>
      <StyledChevronRight colorClassName="accent-text-muted" size={16} />
    </Row>
  );
}

function RowDivider() {
  return (
    <View className="border-x border-border-default bg-bg-card">
      <Divider dividerBgClassName="bg-border-default" />
    </View>
  );
}

export function SpacesListView({ data }: SpacesListViewProps) {
  const sections = React.useMemo(() => toSpaceSections(data), [data]);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(space, index) => `${space.type}:${space.title}:${index}`}
      renderSectionHeader={({ section }) => <SectionHeader section={section} />}
      renderItem={({ item, index, section }) => (
        <SpaceRow
          space={item}
          colorClassname={section.colorClassname}
          first={index === 0}
          last={index === section.data.length - 1}
        />
      )}
      ItemSeparatorComponent={RowDivider}
      renderSectionFooter={() => <View className="h-3" />}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
      className="px-5 py-4"
      contentContainerClassName="pb-10"
      ListFooterComponentClassName="mt-1"
      ListFooterComponent={
        <Row>
          <StyledDoorClosed colorClassName="accent-text-muted" size={14} />
          <Text variant="caption" color="muted">
            Tap a free room to start or schedule a meeting
          </Text>
        </Row>
      }
    />
  );
}
