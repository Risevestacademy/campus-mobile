import { RequestLobbyScreen, useCampusSpace } from "@features/campus";
import { useLocalSearchParams } from "expo-router";

/** Waiting to be let into a locked space, after asking. */
export default function RequestLobby() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { space } = useCampusSpace(id);
  return <RequestLobbyScreen spaceKey={id} spaceName={space?.title ?? id} />;
}
