import { RoomLinkService } from "@services/roomLinks";
import { toast } from "@shared/components/atoms";
import { useMeetingJoin } from "@shared/hooks/ui";
import { Linking } from "react-native";

import type { LiveMeetingItem, MeetingJoinTarget } from "../types";
import { useGoToSpace } from "./useGoToSpace";

/**
 * Joining a meeting that's on now, the same from search and the campus card.
 * A room in your campus opens the join sheet: joining enters through the
 * room link and walks you there. A video call outside campus opens in its
 * own app. A meeting with neither does nothing.
 */
export function useOpenMeeting() {
  const { open } = useMeetingJoin();
  const { goToSpace } = useGoToSpace();

  /** Lets you in through the room link while its event is on, then walks there. */
  const enterRoom = async (
    room: Extract<MeetingJoinTarget, { kind: "campus" }>,
  ) => {
    try {
      await RoomLinkService.enter(room.code);
    } catch (error) {
      // Walk anyway: a closed door can still be asked.
      console.warn("Couldn't enter through the room link:", error);
    }
    if (goToSpace(room.spaceKey, room.spaceName)) {
      toast.success(`Walking to ${room.spaceName}`);
    }
  };

  return ({ join, title, startsAt }: LiveMeetingItem) => {
    if (!join) return;
    if (join.kind === "external") {
      // Calls outside campus open in their own app; the join sheet is for rooms.
      Linking.openURL(join.url).catch(() =>
        toast.error("Couldn't open the meeting link.", "Can't join"),
      );
      return;
    }
    open({
      spaceKey: join.spaceKey,
      title,
      location: join.spaceName,
      startsAt: new Date(startsAt),
      participants: [],
      onJoin: () => void enterRoom(join),
    });
  };
}
