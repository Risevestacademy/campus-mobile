import { LiveIndicator, MeetingParticipants } from "@shared/components";
import { Button, Text } from "@shared/components/atoms";
import { useMeetingJoin } from "@shared/hooks/ui";
import { useRouter } from "expo-router";
import { Video } from "lucide-react-native";
import { View } from "react-native";
import { withUniwind } from "uniwind";

const StyledVideo = withUniwind(Video);

export function LiveMeeting() {
  const router = useRouter();
  const { open } = useMeetingJoin();

  const goToDetails = () => {
    router.push("/(tabs)/(campus)/space/diarahaff");
  };
  const showMeeting = () => {
    open({
      meetingId: "",
      title: "",
      hostName: "",
      startsAt: new Date(),
      participants: [],
      location: "Classroom A",
    });
  };

  return (
    <View className="gap-3 rounded-xl bg-bg-card p-4">
      <View className="flex-row gap-2">
        <LiveIndicator />
        <Text variant="caption" color="secondary">
          Classroom A · started 6 min ago
        </Text>
      </View>
      <Text variant="h5">Design Foundations</Text>
      <MeetingParticipants sideText="Chiemezie + 28 others" />
      <View className="flex-row justify-evenly gap-2">
        <Button
          label="Details"
          className="flex-1"
          variant="secondary"
          onPress={goToDetails}
        />
        <Button className="flex-1" onPress={showMeeting}>
          <StyledVideo colorClassName="accent-text-on-dark" size={16} />
          <Text className="text-text-on-dark">Join Meeting</Text>
        </Button>
      </View>
    </View>
  );
}
