import { VideoTrack } from "@livekit/react-native";
import { Avatar, Text } from "@shared/components/atoms";
import { cn } from "@shared/utils/style";
import { AudioLines, Mic, MicOff } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { withUniwind } from "uniwind";

import type { RoomParticipant } from "../hooks";

const StyledMic = withUniwind(Mic);
const StyledMicOff = withUniwind(MicOff);
const StyledAudioLines = withUniwind(AudioLines);

const TINTS = [
  "bg-bg-tint-coral",
  "bg-bg-tint-sky-card",
  "bg-bg-tint-lemon",
  "bg-bg-tint-violet",
  "bg-bg-tint-turquoise",
];

/** The same person keeps the same tint. */
function tintFor(userId: string) {
  let hash = 0;
  for (const char of userId) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return TINTS[Math.abs(hash) % TINTS.length];
}

export function ParticipantTile({
  participant,
  large = false,
}: {
  participant: RoomParticipant;
  /** The featured speaker: fills the stage. */
  large?: boolean;
}) {
  const {
    name,
    userId,
    isSpeaking,
    isMuted,
    isLocal,
    canPublish,
    cameraTrack,
  } = participant;
  const label = isLocal ? "You" : name;
  const Icon = isSpeaking
    ? StyledAudioLines
    : isMuted
      ? StyledMicOff
      : StyledMic;

  return (
    <View
      className={cn(
        "items-center justify-center overflow-hidden rounded-xl border-3",
        tintFor(userId),
        large ? "flex-1" : "h-31 flex-1",
        isSpeaking ? "border-bg-band-lemon" : "border-transparent",
      )}
    >
      {cameraTrack ? (
        <VideoTrack
          trackRef={cameraTrack}
          style={StyleSheet.absoluteFill}
          objectFit="cover"
          mirror={isLocal}
        />
      ) : (
        <Avatar
          size={large ? 80 : 44}
          placeholder={name.slice(0, 1).toUpperCase()}
          placeholderClassName={cn(
            "text-text-on-accent",
            large && "text-[30px]",
          )}
        />
      )}
      <View className="absolute bottom-4 left-5 max-w-[90%] flex-row items-center gap-1.5 rounded-full bg-text-on-accent px-2 py-1">
        <Icon
          colorClassName={
            isSpeaking ? "accent-text-turquoise-fixed" : "accent-text-coral"
          }
          size={12}
        />
        <Text
          variant="caption"
          numberOfLines={1}
          className="shrink text-text-on-dark"
        >
          {large && canPublish ? `${label} · Host` : label}
        </Text>
      </View>
    </View>
  );
}
