import { AudioSession, LiveKitRoom } from "@livekit/react-native";
import React from "react";

import { useProximitySubscriptions, useRoomConnection } from "../hooks";

type RoomConnection = Pick<
  ReturnType<typeof useRoomConnection>,
  "phase" | "retry" | "walk" | "stuckReason"
>;

const RoomConnectionContext = React.createContext<RoomConnection | undefined>(
  undefined,
);

/** Where the space screen is in getting you into its call. */
export function useRoomConnectionContext(): RoomConnection {
  const value = React.useContext(RoomConnectionContext);
  if (value === undefined) {
    throw new Error(
      "useRoomConnectionContext must be used inside SpaceRoomProvider",
    );
  }
  return value;
}

/** Hears only the nearby, in a proximity space. Renders nothing. */
function ProximitySubscriptions() {
  useProximitySubscriptions();
  return null;
}

/**
 * Connects to `spaceKey`'s call, muted with the camera off, once you are
 * standing in that space and world has sent its call. Mount it on the space
 * screen so leaving the screen leaves the room. Until then, and after a
 * failed or lost call, it renders `children` outside a room.
 */
export function SpaceRoomProvider({
  spaceKey,
  children,
}: {
  spaceKey: string;
  children: React.ReactNode;
}) {
  const connection = useRoomConnection(spaceKey);
  const { call, connect, roomKey } = connection;

  React.useEffect(() => {
    void AudioSession.startAudioSession();
    return () => {
      void AudioSession.stopAudioSession();
    };
  }, []);

  const value: RoomConnection = {
    phase: connection.phase,
    retry: connection.retry,
    walk: connection.walk,
    stuckReason: connection.stuckReason,
  };

  return (
    <RoomConnectionContext.Provider value={value}>
      {call && connect && roomKey ? (
        <LiveKitRoom
          key={roomKey}
          serverUrl={call.url}
          token={call.token}
          connect
          audio={false}
          video={false}
          // Proximity: hear only who `nearby` names, not the whole room.
          connectOptions={{ autoSubscribe: call.hearing !== "proximity" }}
          onConnected={connection.onConnected}
          onDisconnected={connection.onDisconnected}
          onError={(error) => {
            console.warn("[room]", error.message);
            connection.onError();
          }}
        >
          <ProximitySubscriptions />
          {children}
        </LiveKitRoom>
      ) : (
        children
      )}
    </RoomConnectionContext.Provider>
  );
}
