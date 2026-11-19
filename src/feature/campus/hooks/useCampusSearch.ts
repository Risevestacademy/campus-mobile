import { useWorldStore } from "@store/world";
import React from "react";
import { useShallow } from "zustand/react/shallow";

import { searchCampus, toSearchSections } from "../helpers";
import type { SearchFilter } from "../types";
import { useCohortPeople } from "./useCohortPeople";

/**
 * Search results as sections, from your cohort, who of it is on campus, and
 * the map's spaces. Follows the world live, so somebody arriving moves up
 * while you look.
 */
export function useCampusSearch(query: string, filter: SearchFilter) {
  const world = useWorldStore(
    useShallow((state) => ({
      players: state.players,
      spaces: state.spaces,
      selfId: state.selfId,
      lockedSpaces: state.lockedSpaces,
    })),
  );
  const cohort = useCohortPeople();
  const deferredQuery = React.useDeferredValue(query);

  return React.useMemo(
    () => toSearchSections(searchCampus(world, deferredQuery, cohort), filter),
    [world, deferredQuery, cohort, filter],
  );
}
