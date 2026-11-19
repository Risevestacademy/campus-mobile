import { Button, Spinner, Text } from "@shared/components/atoms";
import type { WalkEndReason } from "@shared/lib/generated/world-protocol";
import { useWorldStore } from "@store/world";
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
import { useRoomConnectionContext, useSpaceCallContext } from "../providers";

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

const STUCK: Partial<Record<WalkEndReason, string>> = {
  refused: "This space is closed to you right now.",
  full: "This space is full right now.",
  no_way: "There's no way through to this space.",
};

function Status({
  message,
  busy = false,
  action,
}: {
  message: string;
  busy?: boolean;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-8">
      {busy ? <Spinner size={20} /> : null}
      <Text color="muted" className="text-center">
        {message}
      </Text>
      {action ? (
        <Button
          variant="secondary"
          label={action.label}
          onPress={action.onPress}
        />
      ) : null}
    </View>
  );
}

function RoomState({ name }: { name: string }) {
  const { phase, retry, walk, stuckReason } = useRoomConnectionContext();

  switch (phase) {
    case "joining":
    case "connected":
      return <RoomBody />;
    case "watching":
      return (
        <Status message="You're on campus on another device, so the call is there." />
      );
    case "walking":
      return <Status busy message={`Walking to ${name}…`} />;
    case "stuck":
      return (
        <Status
          message={
            (stuckReason && STUCK[stuckReason]) ?? `You didn't get to ${name}.`
          }
          action={{ label: "Walk there", onPress: walk }}
        />
      );
    case "waiting":
    case "refreshing":
      return <Status busy message="Joining the call…" />;
    case "failed":
      return (
        <Status
          message="Couldn't join the call."
          action={{ label: "Try again", onPress: retry }}
        />
      );
    case "dropped":
      return (
        <Status
          message="The call dropped."
          action={{ label: "Rejoin", onPress: retry }}
        />
      );
  }
}

export function SpaceRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { call } = useSpaceCallContext();
  const name = useWorldStore((state) => state.spaces[id]?.name) ?? id;
  const { top } = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-bg-page">
      <View className="bg-bg-band" style={{ height: top }} />
      <RoomHeader
        title={name}
        subtitle={
          call?.hearing === "proximity" ? "Nearby conversation" : "Open room"
        }
      />
      <RoomState name={name} />
    </View>
  );
}
