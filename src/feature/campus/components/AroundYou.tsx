import {
  Card,
  Divider,
  MultiAvatar,
  Row,
  Text,
} from "@shared/components/atoms";
import { formatParticipantPresentation } from "@shared/helpers";
import { useMeetingJoin } from "@shared/hooks/ui";
import { AudioLines, Hand } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { withUniwind } from "uniwind";

type HappeningAroundYouProps = {
  location: string;
};

const StyledAudioLines = withUniwind(AudioLines);
const StyledHand = withUniwind(Hand);

export function HappeningAroundYou({ location }: HappeningAroundYouProps) {
  const { open } = useMeetingJoin();

  const showMeeting = (participant: { name: string; imageUrl?: string }[]) => {
    open({
      meetingId: "",
      title: formatParticipantPresentation(participant.map((e) => e.name)),
      hostName: "",
      startsAt: new Date(),
      participants: participant,
      location: "Main Hallway",
    });
  };

  const happenings: HappeningProps[] = [
    {
      participant: ["Ayobami", "Victor"],
      desc: "Hallway",
      action: "join",
      onAction: (p) => showMeeting(p?.paticipants! ?? []),
    },
    {
      participant: ["Osemen"],
      desc: "Idle · Project Studio",
      action: "wave",
    },
  ];
  return (
    <Card className="mx-6 gap-1 bg-bg-ink-card">
      <Row justify="between">
        <Text variant="overline" className="text-text-turquoise">
          AROUND YOU
        </Text>
        <Text className="text-text-rail" variant="caption">
          {location}
        </Text>
      </Row>

      {happenings.map((e, i) => {
        const hasDivider = i < happenings.length - 1;

        return (
          <View key={i}>
            <Happening {...e} />
            {hasDivider && (
              <View className="py-1">
                <Divider dividerBgClassName="bg-bg-ink-divider" />
              </View>
            )}
          </View>
        );
      })}
    </Card>
  );
}

type HappeningActionProps = {
  paticipants?: { name: string; imageUrl?: string }[];
};

type HappeningProps = {
  participant: string[];
  onAction?: (props?: HappeningActionProps) => void;
  desc?: string;
  action: "wave" | "join";
};

function Happening({ participant, desc, onAction, action }: HappeningProps) {
  const actionComponent = () => {
    switch (action) {
      case "join":
        return (
          <Row className="gap-1 rounded-full bg-action-primary px-3 py-1">
            <StyledAudioLines colorClassName="accent-text-on-dark" size={14} />
            <Text className="text-text-on-dark" variant="label">
              Join
            </Text>
          </Row>
        );
      case "wave":
        return (
          <View className="size-9 items-center justify-center rounded-full bg-overlay-white-15/14">
            <StyledHand colorClassName="accent-text-on-dark" size={20} />
          </View>
        );
    }
  };
  return (
    <Row className="border-text-on-accent">
      <MultiAvatar
        size={36}
        participants={participant.map((e) => ({ placeholder: e[0] }))}
        ringClassName="border-text-on-accent"
      />
      <View className="flex-1">
        <Text
          variant="label"
          numberOfLines={1}
          className="overflow-hidden text-ellipsis text-text-on-dark"
        >
          {formatParticipantPresentation(participant)}
        </Text>
        <Text
          variant="caption"
          numberOfLines={1}
          className="overflow-hidden text-ellipsis text-text-rail"
        >
          {desc}
        </Text>
      </View>
      <Pressable
        onPress={() => {
          if (!onAction) return;
          return onAction!({
            paticipants: participant.map((e) => ({ name: e })),
          });
        }}
      >
        {actionComponent()}
      </Pressable>
    </Row>
  );
}
