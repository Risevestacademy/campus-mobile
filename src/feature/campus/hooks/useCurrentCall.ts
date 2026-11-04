import type { CallParticipant } from "@shared/components";
import { useMe } from "@shared/hooks/useMe";
import { useAroundMe } from "@store/world";
import { useState } from "react";

/**
 * The conversation you're in, ready for `FloatingCall`: you and everyone
 * within earshot, or null while nobody is. Mute is local and there's no
 * Leave until call audio is wired.
 */
export function useCurrentCall() {
  const { space, earshot } = useAroundMe();
  const { data: me } = useMe();
  const [muted, setMuted] = useState(false);

  if (earshot.length === 0) return null;

  // You lead the call, the same as in its name: "You, Ada +2".
  const participants: CallParticipant[] = [
    {
      id: "you",
      name: "You",
      imageUrl: me?.user.avatarUrl ?? undefined,
      initial: me?.user.displayName?.[0],
    },
    ...earshot.map((player) => ({
      id: player.userId,
      name: player.displayName ?? "Someone",
    })),
  ];

  return {
    participants,
    space: space?.name ?? "",
    muted,
    onToggleMute: () => setMuted((current) => !current),
  };
}
