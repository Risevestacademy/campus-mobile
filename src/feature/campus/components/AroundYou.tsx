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
import { AudioLines } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledAudioLines = withUniwind(AudioLines);

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
            onJoin: joinConversation,
          },
        ]
      : []),
    ...inMySpace.map((player) => ({
      id: player.userId,
      participants: [nameOf(player)],
      desc: [capitalize(player.status), spaceName].filter(Boolean).join(" · "),
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
  /** Only the conversation within earshot can be joined. */
  onJoin?: () => void;
};

function Happening({ participants, desc, onJoin }: HappeningProps) {
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
          {formatParticipantPresentation(participants)}
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
      {onJoin ? (
        <Pressable
          onPress={onJoin}
          accessibilityRole="button"
          accessibilityLabel={`Join ${formatParticipantPresentation(participants)}`}
        >
          <Row className="gap-1 rounded-full bg-action-primary px-3 py-1">
            <StyledAudioLines colorClassName="accent-text-on-dark" size={14} />
            <Text className="text-text-on-dark" variant="label">
              Join
            </Text>
          </Row>
        </Pressable>
      ) : null}
    </Row>
  );
}
