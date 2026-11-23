import { useRemoteParticipants } from "@livekit/react-native";
import React from "react";

import { useBroadcastLive } from "../store/broadcast";

/** How loud the space call stays while a broadcast plays over it. */
export const DUCKED_VOLUME = 0.3;

/**
 * Runs inside the space room. While somebody broadcasts, the space call
 * carries on quieter underneath, as the protocol asks; it comes back up when
 * the broadcast ends. People who join mid-broadcast are lowered too.
 */
export function useBroadcastDucking() {
  const live = useBroadcastLive();
  const remotes = useRemoteParticipants();

  React.useEffect(() => {
    for (const participant of remotes) {
      participant.setVolume(live ? DUCKED_VOLUME : 1);
    }
  }, [live, remotes]);
}
