import { Avatar, Pill, Row, StatusDot, Text } from "@shared/components/atoms";
import {
  CalendarDays,
  DoorClosed,
  ExternalLink,
  FileText,
  Hand,
  Lock,
  Navigation,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { withUniwind } from "uniwind";

import type {
  MeetingResult,
  PersonResult,
  ResourceResult,
  SearchResult,
  SpaceResult,
} from "../types";

const StyledCalendarDays = withUniwind(CalendarDays);
const StyledDoorClosed = withUniwind(DoorClosed);
const StyledExternalLink = withUniwind(ExternalLink);
const StyledFileText = withUniwind(FileText);
const StyledHand = withUniwind(Hand);
const StyledLock = withUniwind(Lock);
const StyledNavigation = withUniwind(Navigation);

/** What each kind of result can do. Any left out does nothing for now. */
export type SearchResultActions = {
  onGoToPerson?: (person: PersonResult) => void;
  onWave?: (person: PersonResult) => void;
  onGoToSpace?: (space: SpaceResult) => void;
  onViewMeeting?: (meeting: MeetingResult) => void;
  onOpenResource?: (resource: ResourceResult) => void;
};

/** One row per result, each type in its own design. */
export function SearchResultRow({
  result,
  actions = {},
}: {
  result: SearchResult;
  actions?: SearchResultActions;
}) {
  switch (result.type) {
    case "people":
      return <PersonRow person={result.data} actions={actions} />;
    case "spaces":
      return (
        <SpaceRow
          space={result.data}
          onGo={() => actions.onGoToSpace?.(result.data)}
        />
      );
    case "meetings":
      return (
        <MeetingRow
          meeting={result.data}
          onView={() => actions.onViewMeeting?.(result.data)}
        />
      );
    case "resources":
      return (
        <ResourceRow
          resource={result.data}
          onOpen={() => actions.onOpenResource?.(result.data)}
        />
      );
  }
}

function PersonRow({
  person,
  actions,
}: {
  person: PersonResult;
  actions: SearchResultActions;
}) {
  return (
    <Row gap="md" className="mx-4 rounded-lg bg-bg-hover p-3">
      <View className="relative">
        <Avatar size={40} placeholder={person.name[0] ?? ""} />
        <StatusDot
          status={person.status}
          className="absolute right-0 bottom-0 size-3 border-2 border-bg-hover"
        />
      </View>
      <View className="flex-1 gap-0.5">
        <Text variant="label" numberOfLines={1}>
          {person.name}
        </Text>
        {person.spaceName ? (
          <Text variant="caption" color="secondary" numberOfLines={1}>
            {person.spaceName}
          </Text>
        ) : null}
      </View>
      <Row gap="sm">
        <IconButton
          label={`Go to ${person.name}`}
          onPress={() => actions.onGoToPerson?.(person)}
        >
          <StyledNavigation size={16} colorClassName="accent-text-primary" />
        </IconButton>
        <IconButton
          label={`Wave at ${person.name}`}
          onPress={() => actions.onWave?.(person)}
        >
          <StyledHand size={16} colorClassName="accent-text-primary" />
        </IconButton>
      </Row>
    </Row>
  );
}

function SpaceRow({ space, onGo }: { space: SpaceResult; onGo: () => void }) {
  const Icon = space.locked ? StyledLock : StyledDoorClosed;
  return (
    <ResultCard
      icon={<Icon size={18} colorClassName="accent-text-primary" />}
      title={space.name}
      subtitle={
        space.people === 1 ? "1 person here" : `${space.people} people here`
      }
      iconLabel={space.locked ? "Locked" : "Open"}
    >
      <PillButton
        label="Go"
        accessibilityLabel={`Go to ${space.name}`}
        onPress={onGo}
      />
    </ResultCard>
  );
}

function MeetingRow({
  meeting,
  onView,
}: {
  meeting: MeetingResult;
  onView: () => void;
}) {
  return (
    <ResultCard
      icon={
        <StyledCalendarDays size={18} colorClassName="accent-text-primary" />
      }
      title={meeting.title}
      subtitle={meeting.when}
    >
      <PillButton
        label="View"
        accessibilityLabel={`View ${meeting.title}`}
        onPress={onView}
      />
    </ResultCard>
  );
}

function ResourceRow({
  resource,
  onOpen,
}: {
  resource: ResourceResult;
  onOpen: () => void;
}) {
  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="link"
      accessibilityLabel={`Open ${resource.title} in Rise Classroom`}
    >
      <ResultCard
        icon={<StyledFileText size={18} colorClassName="accent-text-primary" />}
        title={resource.title}
        subtitle="Rise Classroom"
      >
        <StyledExternalLink size={16} colorClassName="accent-text-muted" />
      </ResultCard>
    </Pressable>
  );
}

/** Spaces, meetings and resources: icon, title over subtitle, then an action. */
function ResultCard({
  icon,
  iconLabel,
  title,
  subtitle,
  children,
  withIconBg = true,
}: {
  icon: ReactNode;
  withIconBg?: boolean;
  iconLabel?: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <Row gap="md" className="mx-4 p-3">
      <View
        accessible={Boolean(iconLabel)}
        accessibilityLabel={iconLabel}
        importantForAccessibility={iconLabel ? "yes" : "no-hide-descendants"}
        className={
          withIconBg
            ? "items-center justify-center rounded-md bg-bg-tint-violet p-2"
            : undefined
        }
      >
        {icon}
      </View>
      <View className="flex-1 gap-0.5">
        <Text variant="label" numberOfLines={1}>
          {title}
        </Text>
        <Text variant="caption" color="secondary" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      {children}
    </Row>
  );
}

function PillButton({
  label,
  accessibilityLabel,
  onPress,
}: {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Pill
        color="neutral"
        variant="subtle"
        label={label}
        size="lg"
        className="border border-border-default bg-bg-card"
        labelClassName="text-text-primary"
      />
    </Pressable>
  );
}

function IconButton({
  label,
  onPress,
  children,
}: {
  label: string;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="size-9 items-center justify-center rounded-full bg-bg-card active:opacity-80"
    >
      {children}
    </Pressable>
  );
}
