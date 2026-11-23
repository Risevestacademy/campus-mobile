import {
  useLocalParticipant,
  useRemoteParticipants,
  useRoomContext,
} from "@livekit/react-native";
import React from "react";

import { useBroadcastStore } from "../store/broadcast";
import { userIdFromIdentity } from "./useRoomParticipants";

/**
 * Runs inside the broadcast room and tells the rest of the app what it's
 * doing. A broadcast is live while somebody's microphone is published and on
 * in this room; it starts and stops as they publish and unpublish.
 */
export function useBroadcastSync(canSpeak: boolean) {
  const room = useRoomContext();
  const remotes = useRemoteParticipants();
  const { isMicrophoneEnabled } = useLocalParticipant();
  const sync = useBroadcastStore((state) => state.sync);
  const reset = useBroadcastStore((state) => state.reset);

  const speakers = remotes
    .filter((participant) => participant.isMicrophoneEnabled)
    .map((participant) => userIdFromIdentity(participant.identity));
  const speakersKey = speakers.join(",");

  React.useEffect(() => {
    sync({
      room,
      canSpeak,
      speakers: speakersKey ? speakersKey.split(",") : [],
      speaking: isMicrophoneEnabled,
    });
  }, [sync, room, canSpeak, speakersKey, isMicrophoneEnabled]);

  // Leaving the room ends whatever the app thought it was doing.
  React.useEffect(() => reset, [reset]);
}
