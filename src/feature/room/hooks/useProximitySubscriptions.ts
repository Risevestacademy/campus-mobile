import { useRemoteParticipants } from "@livekit/react-native";
import React from "react";

import { useSpaceCallContext } from "../providers/SpaceCallProvider";
import { userIdFromIdentity } from "./useRoomParticipants";

/**
 * In a proximity space you hear only the people the latest `nearby` names.
 * The room connects with auto-subscribe off; this subscribes to their tracks
 * and drops everyone else's as `nearby` and the room change. Hiding a tile
 * isn't enough: an unsubscribed track is one you don't hear.
 */
export function useProximitySubscriptions() {
  const { call, nearbyUserIds } = useSpaceCallContext();
  const remotes = useRemoteParticipants();
  const proximity = call?.hearing === "proximity";

  React.useEffect(() => {
    if (!proximity) return;
    const nearby = new Set(nearbyUserIds);
    for (const participant of remotes) {
      const hear = nearby.has(userIdFromIdentity(participant.identity));
      for (const publication of participant.trackPublications.values()) {
        if (publication.isDesired !== hear) publication.setSubscribed(hear);
      }
    }
  }, [proximity, remotes, nearbyUserIds]);
}
