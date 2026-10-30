import {
  Card,
  Divider,
  MultiAvatar,
  Row,
  Text,
} from "@shared/components/atoms";
import { capitalize, formatParticipantPresentation } from "@shared/helpers";
import { useMeetingJoin } from "@shared/hooks/ui";
import { type Presence, useAroundMe, useWorldReady } from "@store/world";
import { AudioLines, Hand, Navigation } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { withUniwind } from "uniwind";

import { useCurrentCall } from "../hooks";

const StyledAudioLines = withUniwind(AudioLines);
const StyledHand = withUniwind(Hand);
const StyledNavigation = withUniwind(Navigation);

function nameOf(player: Presence) {
  return player.displayName ?? "Someone";
}

/**
 * Who is around you on campus: the conversation within earshot, then anyone
 * else standing in your space. Hidden until world's first snapshot.
 */
export function HappeningAroundYou() {
  const ready = useWorldReady();
  const { space, earshot, inMySpace } = useAroundMe();
  const { open } = useMeetingJoin();
  // The conversation within earshot is the call shown floating over the app.
  const inCall = useCurrentCall() !== null;

  if (!ready) return null;

  const spaceName = space?.name ?? "";

  const joinConversation = () => {
    const participants = earshot.map((player) => ({ name: nameOf(player) }));
    open({
      meetingId: space?.spaceKey ?? "",
      title: formatParticipantPresentation(participants.map((p) => p.name)),
      hostName: "",
      startsAt: new Date(),
      participants,
      location: spaceName,
    });
  };

  const happenings: HappeningProps[] = [
    ...(earshot.length > 0
      ? [
          {
            id: "earshot",
            participants: earshot.map(nameOf),
            desc: spaceName,
            inCall,
            onJoin: joinConversation,
          },
        ]
      : []),
    ...inMySpace.map((player) => ({
      id: player.userId,
      participants: [nameOf(player)],
      desc: [capitalize(player.status), spaceName].filter(Boolean).join(" · "),
      // No wave message or way to move there yet: buttons without actions.
      person: true,
    })),
  ];

  return (
    <Card className="mx-6 gap-1 bg-bg-ink-card">
      <Row justify="between">
        <Text variant="overline" className="text-text-turquoise">
          AROUND YOU
        </Text>
        <Text className="text-text-rail" variant="caption">
          {spaceName}
        </Text>
      </Row>

      {happenings.length === 0 ? (
        <Text variant="caption" className="py-2 text-text-rail">
          Nobody else is here right now.
        </Text>
      ) : (
        happenings.map((happening, i) => (
          <View key={happening.id}>
            <Happening {...happening} />
            {i < happenings.length - 1 && (
              <View className="py-1">
                <Divider dividerBgClassName="bg-bg-ink-divider" />
              </View>
            )}
          </View>
        ))
      )}
    </Card>
  );
}

type HappeningProps = {
  id: string;
  participants: string[];
  desc?: string;
  /** You're already in it: shows a disabled "In call" in place of Join. */
  inCall?: boolean;
  /** Only the conversation within earshot can be joined. */
  onJoin?: () => void;
  /** Rows for one person, outside the call, get Wave and Navigate. */
  person?: boolean;
  onWave?: () => void;
  onNavigate?: () => void;
};

function Happening({
  participants,
  desc,
  inCall,
  onJoin,
  person,
  onWave,
  onNavigate,
}: HappeningProps) {
  const who = formatParticipantPresentation(participants);

  return (
    <Row className="border-text-on-accent">
      <MultiAvatar
        size={36}
        participants={participants.map((name) => ({
          placeholder: name[0] ?? "",
        }))}
        ringClassName="border-text-on-accent"
      />
      <View className="flex-1">
        <Text
          variant="label"
          numberOfLines={1}
          className="overflow-hidden text-ellipsis text-text-on-dark"
        >
          {who}
        </Text>
        {desc ? (
          <Text
            variant="caption"
            numberOfLines={1}
            className="overflow-hidden text-ellipsis text-text-rail"
          >
            {desc}
          </Text>
        ) : null}
      </View>
      {inCall ? (
        <Row
          className="gap-1 rounded-full bg-overlay-white-15 px-3 py-1"
          accessible
          accessibilityRole="button"
          accessibilityLabel={`In call with ${who}`}
          accessibilityState={{ disabled: true }}
        >
          <StyledAudioLines colorClassName="accent-text-rail" size={14} />
          <Text className="text-text-rail" variant="label">
            In call
          </Text>
        </Row>
      ) : onJoin ? (
        <Pressable
          onPress={onJoin}
          accessibilityRole="button"
          accessibilityLabel={`Join ${who}`}
        >
          <Row className="gap-1 rounded-full bg-action-primary px-3 py-1">
            <StyledAudioLines colorClassName="accent-text-on-dark" size={14} />
            <Text className="text-text-on-dark" variant="label">
              Join
            </Text>
          </Row>
        </Pressable>
      ) : person ? (
        <Row className="gap-2">
          <RoundButton label={`Wave at ${who}`} onPress={onWave}>
            <StyledHand colorClassName="accent-text-on-dark" size={18} />
          </RoundButton>
          <RoundButton label={`Navigate to ${who}`} onPress={onNavigate}>
            <StyledNavigation colorClassName="accent-text-on-dark" size={18} />
          </RoundButton>
        </Row>
      ) : null}
    </Row>
  );
}

function RoundButton({
  children,
  label,
  onPress,
}: {
  children: React.ReactNode;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="size-9 items-center justify-center rounded-full bg-overlay-white-15/14"
    >
      {children}
    </Pressable>
  );
}
