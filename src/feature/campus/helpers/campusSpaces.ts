import type { WorldState } from "@store/world";

import type {
  LiveMeetingItem,
  Space,
  SpaceFilter,
  SpaceStatus,
} from "../types";

/** The corridors and grounds: everywhere outside a drawn space. */
const CORRIDORS = "_default";

/** How many names a subtitle shows before "+N". */
const NAMES_SHOWN = 2;

/** "Ada, Bo +2", or "Nobody here". */
function whoIsHere(names: string[]) {
  if (names.length === 0) return "Nobody here";
  const shown = names.slice(0, NAMES_SHOWN).join(", ");
  const more = names.length - NAMES_SHOWN;
  return more > 0 ? `${shown} +${more}` : shown;
}

/**
 * The meetings on now that are held in a space on your campus, by space key.
 * A video call outside campus has no space, so it doesn't count.
 */
function meetingsBySpace(live: LiveMeetingItem[]) {
  const bySpace = new Map<string, string>();
  for (const meeting of live) {
    if (meeting.join?.kind !== "campus") continue;
    // Two at once in one room: the first named is enough to say it's live.
    if (!bySpace.has(meeting.join.spaceKey)) {
      bySpace.set(meeting.join.spaceKey, meeting.title);
    }
  }
  return bySpace;
}

/**
 * Every space on the map as the spaces list shows it: its name, who is in
 * it and whether it's locked, from world; whether a meeting is on there now,
 * from your calendar. World doesn't say what a space is for, so a space that
 * can be locked counts as private and the rest as common. The corridors are
 * left out: they're not somewhere you'd go.
 */
export function toCampusSpaces(
  world: Pick<
    WorldState,
    "spaces" | "players" | "lockedSpaces" | "lockableSpaces"
  >,
  live: LiveMeetingItem[] = [],
): Space[] {
  const namesIn = new Map<string, string[]>();
  for (const player of Object.values(world.players)) {
    const names = namesIn.get(player.spaceKey) ?? [];
    names.push(player.displayName ?? "Someone");
    namesIn.set(player.spaceKey, names);
  }
  const locked = new Set(world.lockedSpaces);
  const lockable = new Set(world.lockableSpaces);
  const meetings = meetingsBySpace(live);

  return Object.values(world.spaces)
    .filter((space) => space.spaceKey !== CORRIDORS)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((space) => {
      const names = (namesIn.get(space.spaceKey) ?? []).sort((a, b) =>
        a.localeCompare(b),
      );
      const isLocked = locked.has(space.spaceKey);
      const meeting = meetings.get(space.spaceKey);
      const status: SpaceStatus = meeting
        ? "live"
        : isLocked
          ? "locked"
          : names.length > 0
            ? "occupied"
            : "empty";
      const subtitle = [meeting, isLocked && "Locked", whoIsHere(names)]
        .filter(Boolean)
        .join(" · ");
      return {
        key: space.spaceKey,
        title: space.name,
        subtitle,
        people: names,
        ...(meeting ? { meeting } : {}),
        participants: names.length,
        status,
        type: lockable.has(space.spaceKey) ? "private" : "common",
      };
    });
}

/**
 * Whether `space` belongs under `filter` and matches the search `query`: by
 * its name, the meeting on there, or somebody in it. Not by the subtitle,
 * whose "Nobody here" would match "bo".
 */
export function matchesSpace(space: Space, filter: SpaceFilter, query: string) {
  const q = query.trim().toLowerCase();
  const matchesQuery =
    q === "" ||
    space.title.toLowerCase().includes(q) ||
    (space.meeting?.toLowerCase().includes(q) ?? false) ||
    space.people.some((name) => name.toLowerCase().includes(q));
  return matchesQuery && (filter === "all" || space.status === filter);
}
