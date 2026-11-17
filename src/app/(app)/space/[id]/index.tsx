import { SpaceRoomProvider, SpaceRoomScreen } from "@features/room";

export default function SpaceIndex() {
  return (
    <SpaceRoomProvider>
      <SpaceRoomScreen />
    </SpaceRoomProvider>
  );
}
