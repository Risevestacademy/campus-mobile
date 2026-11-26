import { useWorldStore } from "@store/world";
import React from "react";
import { useShallow } from "zustand/react/shallow";

import { toCampusSpaces } from "../helpers";
import { useHappeningNow } from "./useHappeningNow";

/**
 * The map's spaces with who is in each, live from the world socket: someone
 * stepping in, a lock, a rename all show at once. A space whose calendar
 * meeting is on now is marked live. `ready` is false until world's first
 * snapshot, and again while the socket is down.
 */
export function useCampusSpaces() {
  const world = useWorldStore(
    useShallow((state) => ({
      ready: state.ready,
      spaces: state.spaces,
      players: state.players,
      lockedSpaces: state.lockedSpaces,
      lockableSpaces: state.lockableSpaces,
      selfId: state.selfId,
    })),
  );
  const live = useHappeningNow();

  const spaces = React.useMemo(
    () => toCampusSpaces(world, live),
    [world, live],
  );
  const people = React.useMemo(
    () => spaces.reduce((sum, space) => sum + space.participants, 0),
    [spaces],
  );

  return { ready: world.ready, spaces, people };
}

/**
 * One space by its world key, kept live like the list. `space` is undefined
 * until world's first snapshot (`ready` false), or when the key isn't on the
 * map, e.g. an old link after the map changed.
 */
export function useCampusSpace(key: string) {
  const { ready, spaces } = useCampusSpaces();
  const space = React.useMemo(
    () => spaces.find((candidate) => candidate.key === key),
    [spaces, key],
  );
  return { ready, space };
}
