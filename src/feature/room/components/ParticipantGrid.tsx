import { Text } from "@shared/components/atoms";
import { Users } from "lucide-react-native";
import { View } from "react-native";
import { withUniwind } from "uniwind";

import { splitStage, useRoomParticipants } from "../hooks";
import { ParticipantTile } from "./ParticipantTile";

const StyledUsers = withUniwind(Users);

export function ParticipantGrid() {
  const participants = useRoomParticipants();
  const { featured, row, listeners } = splitStage(participants);

  if (!featured) return null;

  return (
    <View className="flex-1 gap-3">
      <View className="flex-1">
        <ParticipantTile participant={featured} large />
      </View>
      {row.length > 0 && (
        <View className="flex-row gap-3">
          {row.map((p) => (
            <ParticipantTile key={p.identity} participant={p} />
          ))}
        </View>
      )}
      {participants.length <= 1 ? (
        <Text color="muted" variant="caption" className="text-center">
          It&apos;s quiet here
        </Text>
      ) : listeners.length > 0 ? (
        <View className="flex-row items-center justify-center gap-1.5">
          <StyledUsers colorClassName="accent-text-muted" size={14} />
          <Text color="muted" variant="caption">
            +{listeners.length} listening
          </Text>
        </View>
      ) : null}
    </View>
  );
}
