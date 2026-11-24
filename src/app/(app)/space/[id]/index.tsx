import { SpaceRoomScreen } from "@features/room";
import { useLocalSearchParams } from "expo-router";

export default function SpaceIndex() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // Keyed so opening another space starts its walk and state afresh.
  return <SpaceRoomScreen key={id} spaceKey={id} />;
}
