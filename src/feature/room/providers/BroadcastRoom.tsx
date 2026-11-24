import { LiveKitRoom } from "@livekit/react-native";
import type { BroadcastCall } from "@shared/lib/generated/world-protocol";

import {
  useAudioSession,
  useBroadcastCall,
  useBroadcastConnection,
  useBroadcastSync,
} from "../hooks";

/** Inside the room: reports who's broadcasting. Renders nothing. */
function BroadcastSync({ canSpeak }: { canSpeak: boolean }) {
  useBroadcastSync(canSpeak);
  return null;
}

function ConnectedBroadcast({ call }: { call: BroadcastCall }) {
  useAudioSession();
  const { connect, roomKey, onConnected, onDisconnected, onError } =
    useBroadcastConnection(call);

  if (!connect || !roomKey) return null;

  return (
    <LiveKitRoom
      key={roomKey}
      serverUrl={call.url}
      token={call.token}
      connect
      // Listeners never publish; an admin turns their microphone on to speak.
      audio={false}
      video={false}
      // Every voice in here plays, over everything else.
      connectOptions={{ autoSubscribe: true }}
      onConnected={onConnected}
      onDisconnected={onDisconnected}
      // Stable across renders: a new onError makes LiveKit reconnect.
      onError={onError}
    >
      <BroadcastSync canSpeak={call.canSpeak} />
    </LiveKitRoom>
  );
}

/**
 * The cohort's broadcast room, where admins speak to the whole campus. Mount
 * it once, beside the navigator rather than around it: you stay in it
 * wherever you walk, alongside the call for your space, and it renders no UI
 * of its own (see `BroadcastBanner`).
 */
export function BroadcastRoom() {
  const call = useBroadcastCall();
  if (!call) return null;
  // A new room (or admin rights) starts a fresh connection.
  return (
    <ConnectedBroadcast key={`${call.room}:${call.canSpeak}`} call={call} />
  );
}
