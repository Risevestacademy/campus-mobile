import { useParticipants, type VideoTrackProps } from "@livekit/react-native";
import type { Track } from "livekit-client";

import { useSpaceCallContext } from "../providers/SpaceCallProvider";

type TrackReference = NonNullable<VideoTrackProps["trackRef"]>;

export interface RoomParticipant {
  identity: string;
  userId: string;
  name: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isLocal: boolean;
  isCameraOn: boolean;
  /** The published camera video, when it is on. */
  cameraTrack: TrackReference | undefined;
  /** Allowed to speak: host or speaker, not just listening. */
  canPublish: boolean;
}

/** Identity is `<userId>:<suffix>`. */
export function userIdFromIdentity(identity: string): string {
  return identity.split(":")[0] ?? identity;
}

/**
 * Who to show in the room. In a proximity space only the people the latest
 * `nearby` names are listed; in a room space, everyone. You are always listed.
 */
export function useRoomParticipants(): RoomParticipant[] {
  const { call, nearbyUserIds } = useSpaceCallContext();
  const participants = useParticipants();

  return participants
    .map((p) => {
      const publication = p.getTrackPublication?.("camera" as Track.Source);
      const isCameraOn = !!publication && !publication.isMuted;
      return {
        identity: p.identity,
        userId: userIdFromIdentity(p.identity),
        name: p.name || "Guest",
        isSpeaking: p.isSpeaking,
        isMuted: !p.isMicrophoneEnabled,
        isLocal: p.isLocal,
        isCameraOn,
        cameraTrack:
          isCameraOn && publication
            ? ({
                participant: p,
                publication,
                source: publication.source,
              } as TrackReference)
            : undefined,
        canPublish: p.permissions?.canPublish ?? false,
      };
    })
    .filter(
      (p) =>
        p.isLocal ||
        call?.hearing !== "proximity" ||
        nearbyUserIds.includes(p.userId),
    );
}

export interface Stage {
  featured: RoomParticipant | undefined;
  /** Up to three more on the stage row, you included. */
  row: RoomParticipant[];
  /** Everyone else, listening. */
  listeners: RoomParticipant[];
}

const ROW_SIZE = 3;

/**
 * Splits the room for the stage layout: the loudest speaker (else the first
 * who can speak, else the first person) is featured; the row holds the other
 * speakers, then you; the rest listen.
 */
export function splitStage(participants: RoomParticipant[]): Stage {
  const featured =
    participants.find((p) => p.isSpeaking && p.canPublish) ??
    participants.find((p) => p.canPublish) ??
    participants.find((p) => !p.isLocal) ??
    participants[0];
  const others = participants.filter((p) => p !== featured);
  const local = others.find((p) => p.isLocal);
  const speakers = others.filter((p) => p.canPublish && !p.isLocal);
  const row = [...speakers, ...(local ? [local] : [])].slice(0, ROW_SIZE);
  // Make room for you even when speakers fill the row.
  if (local && !row.includes(local)) row[ROW_SIZE - 1] = local;
  return {
    featured,
    row,
    listeners: others.filter((p) => !row.includes(p)),
  };
}
