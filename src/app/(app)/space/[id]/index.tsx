import { SpaceRoomProvider, SpaceRoomScreen } from "@features/room";
import { useLocalSearchParams } from "expo-router";

export default function SpaceIndex() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    // Keyed so opening another space starts its connection afresh.
    <SpaceRoomProvider key={id} spaceKey={id}>
      <SpaceRoomScreen />
    </SpaceRoomProvider>
  );
}
