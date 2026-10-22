import { cn } from "@shared/utils/style";
import { ClassValue } from "clsx";
import { View } from "react-native";

import { Avatar, type AvatarProps } from "./Avatar";

export type AvatarParticipant = Omit<AvatarProps, "size"> & { id?: string };

type MultiAvatarProps = Omit<AvatarProps, "imageUrl" | "placeholder"> & {
  participants: AvatarParticipant[];
  overlap?: number;
  max?: number;
  ringWidth?: number;
  ringClassName?: ClassValue;
  ringColor?: string;
};

export function MultiAvatar({
  participants,
  size = 40,
  bg,
  placeholderClassName,
  overlap = Math.round(size * 0.3),
  max,
  ringWidth = 2,
  ringClassName = "border-bg-page dark:border-bg-ink-page",
  ringColor,
}: MultiAvatarProps) {
  const visible = max ? participants.slice(0, max) : participants;
  const overflow = participants.length - visible.length;

  const items: AvatarParticipant[] = overflow
    ? [...visible, { placeholder: `+${overflow}` }]
    : visible;

  return (
    <View className="flex-row items-center">
      {items.map((participant, index) => (
        <View
          key={participant.id ?? index}
          className={cn("rounded-full", ringClassName)}
          style={{
            borderWidth: ringWidth,
            marginLeft: index === 0 ? 0 : -overlap,
            zIndex: index,
            ...(ringColor ? { borderColor: ringColor } : {}),
          }}
        >
          <Avatar
            size={size}
            imageUrl={participant.imageUrl}
            placeholder={participant.placeholder}
            bg={participant.bg ?? bg}
            placeholderClassName={
              participant.placeholderClassName ?? placeholderClassName
            }
          />
        </View>
      ))}
    </View>
  );
}
