import { Text } from "@shared/components/atoms";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ConnectionBanner,
  ParticipantGrid,
  RoomChips,
  RoomControls,
  RoomHeader,
} from "../components";
import { useRoomParticipants } from "../hooks";
import { useSpaceCallContext } from "../providers";

function RoomBody() {
  const people = useRoomParticipants().length;
  return (
    <>
      <View className="flex-1 gap-3 px-4 pt-4">
        <ConnectionBanner />
        <ParticipantGrid />
        <RoomChips people={people} />
      </View>
      <RoomControls />
    </>
  );
}

export function SpaceRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { call } = useSpaceCallContext();
  const { top } = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-bg-page">
      <View className="bg-bg-band" style={{ height: top }} />
      <RoomHeader
        title={id}
        subtitle={
          call?.hearing === "proximity" ? "Nearby conversation" : "Open room"
        }
      />
      {call ? (
        <RoomBody />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text color="muted">Waiting to join…</Text>
        </View>
      )}
    </View>
  );
}
