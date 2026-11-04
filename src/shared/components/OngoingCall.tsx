import { cn } from "@shared/utils/style";
import { AudioLines, LogOut, Mic, MicOff } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { withUniwind } from "uniwind";

import { MultiAvatar, Text } from "./atoms";

const StyledAudioLines = withUniwind(AudioLines);
const StyledMic = withUniwind(Mic);
const StyledMicOff = withUniwind(MicOff);
const StyledLogOut = withUniwind(LogOut);

export type CallParticipant = {
  id?: string;
  name: string;
  imageUrl?: string;
  /** Avatar letter when it isn't the name's first, e.g. for "You". */
  initial?: string;
};

type OngoingCallProps = {
  participants: CallParticipant[];
  space: string;
  callTitle?: string;
  duration?: string;
  muted?: boolean;
  onToggleMute?: () => void;
  onLeave?: () => void;
  className?: string;
};

const SHOWN_AVATARS = 3;
const SHOWN_NAMES = 2;

/** "Ada", "Ada, Cy", or "Ada, Cy +3" for anyone past the first two. */
export function formatCallNames(names: string[]) {
  const shown = names.slice(0, SHOWN_NAMES).join(", ");
  const rest = names.length - SHOWN_NAMES;
  return rest > 0 ? `${shown} +${rest}` : shown;
}

/** The call you're in: who's on it, where, and controls to mute or leave. */
export function OngoingCall({
  participants,
  space,
  callTitle,
  duration,
  muted = false,
  onToggleMute,
  onLeave,
  className,
}: OngoingCallProps) {
  const names = formatCallNames(participants.map((p) => p.name));
  const details = [callTitle, space, duration].filter(Boolean).join(" · ");

  return (
    <View
      className={cn(
        "w-full flex-row items-center gap-2 rounded-full bg-bg-tag p-3",
        className,
      )}
    >
      <MultiAvatar
        size={32}
        participants={participants.slice(0, SHOWN_AVATARS).map((p) => ({
          id: p.id,
          imageUrl: p.imageUrl,
          placeholder: p.initial ?? p.name[0] ?? "",
        }))}
        ringClassName="border-bg-tag border border-[2px]"
      />
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-1">
          <StyledAudioLines colorClassName="accent-turquoise-300" size={12} />
          <Text
            variant="label"
            className="shrink text-text-on-dark"
            numberOfLines={1}
          >
            {names}
          </Text>
        </View>
        {details ? (
          <Text variant="caption" className="text-text-rail" numberOfLines={1}>
            {details}
          </Text>
        ) : null}
      </View>
      <IconButton
        className="bg-overlay-white-15"
        label={muted ? "Unmute" : "Mute"}
        onPress={onToggleMute}
      >
        {muted ? (
          <StyledMicOff colorClassName="accent-text-on-dark" size={16} />
        ) : (
          <StyledMic colorClassName="accent-text-on-dark" size={16} />
        )}
      </IconButton>
      <IconButton
        className="bg-status-danger"
        label="Leave call"
        onPress={onLeave}
      >
        <StyledLogOut colorClassName="accent-text-on-dark" size={16} />
      </IconButton>
    </View>
  );
}

function IconButton({
  children,
  className,
  label,
  onPress,
}: {
  children: ReactNode;
  className: string;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      className={cn(
        "size-9 items-center justify-center rounded-full",
        className,
      )}
    >
      {children}
    </Pressable>
  );
}
