import { RoomContext } from "@livekit/react-native";
import { Room } from "livekit-client";
import React from "react";

import {
  useAudioSession,
  useBroadcastDucking,
  useProximitySubscriptions,
  useSpaceRoom,
} from "../hooks";

type SpaceRoom = ReturnType<typeof useSpaceRoom>;

const SpaceRoomContext = React.createContext<SpaceRoom | undefined>(undefined);

/** The app-wide space call: its phase, `retry`, and `open` for space screens. */
export function useSpaceRoomContext(): SpaceRoom {
  const value = React.useContext(SpaceRoomContext);
  if (value === undefined) {
    throw new Error("useSpaceRoomContext must be used inside SpaceRoomHost");
  }
  return value;
}

/**
 * While in the call: hear only the nearby in a proximity space, go quieter
 * under a broadcast, and hold the audio session open. Renders nothing.
 */
function SpaceAudio() {
  useAudioSession();
  useProximitySubscriptions();
  useBroadcastDucking();
  return null;
}

/**
 * Keeps you in the call for the space you're standing in, wherever you are
 * in the app, so you hear people as soon as they're in earshot. One `Room`
 * for the app's life, given to LiveKit's hooks through `RoomContext`: the
 * space screen, the floating call and the rest read the same call. Mount it
 * inside `SpaceCallProvider`, around the screens.
 */
export function SpaceRoomHost({ children }: { children: React.ReactNode }) {
  const [room] = React.useState(() => new Room());
  const spaceRoom = useSpaceRoom(room);
  const inCall =
    spaceRoom.phase === "connecting" || spaceRoom.phase === "connected";

  return (
    <SpaceRoomContext.Provider value={spaceRoom}>
      <RoomContext.Provider value={room}>
        {inCall ? <SpaceAudio /> : null}
        {children}
      </RoomContext.Provider>
    </SpaceRoomContext.Provider>
  );
}
