import type { CallParticipant } from "@shared/components";
import { useMe } from "@shared/hooks/useMe";
import { useAroundMe, useIsWatching } from "@store/world";

/**
 * The conversation you're in, ready for `FloatingCall`: you and everyone
 * within earshot, or null while nobody is. Mute is not here: it is the mic
 * of the app-wide room, which the tabs layout joins on (`useCallMute`). There
 * is no Leave yet.
 */
export function useCurrentCall() {
  const { space, earshot } = useAroundMe();
  const { data: me } = useMe();
  const watching = useIsWatching();

  // A watcher is never sent a call: the device standing for you is in it.
  if (watching || earshot.length === 0) return null;

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
  };
}
