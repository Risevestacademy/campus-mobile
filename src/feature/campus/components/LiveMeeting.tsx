import { LiveIndicator } from "@shared/components";
import { Button, MultiAvatar, Row, Text } from "@shared/components/atoms";
import { useRouter } from "expo-router";
import { Video } from "lucide-react-native";
import { View } from "react-native";
import { withUniwind } from "uniwind";

import {
  useCampusSpace,
  useHappeningNow,
  useMinuteClock,
  useOpenMeeting,
} from "../hooks";
import type { LiveMeetingItem } from "../types";

const StyledVideo = withUniwind(Video);

const MINUTE = 60_000;

/** "just started", "started 6 min ago", "started 1 h 5 min ago". */
function startedAgo(startsAt: string, now: number) {
  const minutes = Math.max(
    0,
    Math.floor((now - Date.parse(startsAt)) / MINUTE),
  );
  if (minutes < 1) return "just started";
  if (minutes < 60) return `started ${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `started ${hours} h${rest ? ` ${rest} min` : ""} ago`;
}

/** "Chiemezie + 28 others", "You", or that nobody's in yet. */
function whoIsIn(people: string[]) {
  if (people.length === 0) return "Nobody's in yet";
  if (people.length === 1) return people[0];
  const others = people.length - 1;
  return `${people[0]} + ${others} ${others === 1 ? "other" : "others"}`;
}

type CampusRoom = Extract<
  NonNullable<LiveMeetingItem["join"]>,
  { kind: "campus" }
>;

/**
 * The first meeting on now that's held in a room on your campus: the only
 * kind you can join from the app. Video calls elsewhere aren't shown.
 */
function pickMeeting(live: LiveMeetingItem[]) {
  for (const meeting of live) {
    if (meeting.join?.kind === "campus") {
      return { meeting, room: meeting.join as CampusRoom };
    }
  }
  return null;
}

/**
 * The meeting on your calendar that's on right now in a room on your
 * campus, while it lasts: it leaves the moment its end time passes. Who's in
 * comes from world. Hidden when no such meeting is on.
 */
export function LiveMeeting() {
  const router = useRouter();
  const openMeeting = useOpenMeeting();
  const now = useMinuteClock();
  const picked = pickMeeting(useHappeningNow());
  const { space } = useCampusSpace(picked?.room.spaceKey ?? "");

  if (!picked) return null;

  const { meeting, room } = picked;
  const people = space?.people ?? [];

  return (
    <View className="gap-3 rounded-xl bg-bg-card p-4">
      <View className="flex-row gap-2">
        <LiveIndicator />
        <Text variant="caption" color="secondary" numberOfLines={1}>
          {[meeting.location, startedAgo(meeting.startsAt, now)]
            .filter(Boolean)
            .join(" · ")}
        </Text>
      </View>
      <Text variant="h5" numberOfLines={2}>
        {meeting.title}
      </Text>
      <Row gap="sm">
        {people.length > 0 ? (
          <MultiAvatar
            size={24}
            max={3}
            participants={people.map((name, index) => ({
              id: `${name}:${index}`,
              placeholder: name.slice(0, 1).toUpperCase(),
            }))}
          />
        ) : null}
        <Text variant="caption" color="secondary" className="shrink">
          {whoIsIn(people)}
        </Text>
      </Row>
      <View className="flex-row justify-evenly gap-2">
        <Button
          label="Details"
          className="flex-1"
          variant="secondary"
          onPress={() =>
            router.push({
              pathname: "/(app)/space/[id]",
              params: { id: room.spaceKey },
            })
          }
        />
        <Button className="flex-1" onPress={() => openMeeting(meeting)}>
          <StyledVideo colorClassName="accent-text-on-dark" size={16} />
          <Text className="text-text-on-dark">Join Meeting</Text>
        </Button>
      </View>
    </View>
  );
}
