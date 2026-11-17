import { AudioSession, LiveKitRoom } from "@livekit/react-native";
import { toast } from "@shared/components/atoms";
import React from "react";

import { useSpaceCallContext } from "./SpaceCallProvider";

/**
 * Connects to the room of the space you are standing in, muted with the
 * camera off. Mount it on the space screen so leaving the screen leaves the
 * room. Keyed on `call.room`, so stepping into another space leaves one room
 * and joins the next. Without a call it renders `children` outside a room.
 *
 * A join that fails (a rejected token, say) stops instead of retrying in a
 * loop; a new `call` from the server tries again.
 */
export function SpaceRoomProvider({ children }: { children: React.ReactNode }) {
  const { call } = useSpaceCallContext();
  const [failedToken, setFailedToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    void AudioSession.startAudioSession();
    return () => {
      void AudioSession.stopAudioSession();
    };
  }, []);

  if (call === null) return <>{children}</>;

  const fail = (message: string) => {
    console.warn("[room]", message);
    if (failedToken === call.token) return;
    setFailedToken(call.token);
    toast.error("Couldn't join the call.");
  };

  return (
    <LiveKitRoom
      key={call.room}
      serverUrl={call.url}
      token={call.token}
      connect={failedToken !== call.token}
      audio={false}
      video={false}
      onError={(error) => fail(error.message)}
      onDisconnected={() => fail("disconnected")}
    >
      {children}
    </LiveKitRoom>
  );
}
