import type { Presence, WorldState } from "@store/world";

import type { SearchResults } from "../types";

/** Lower case, without accents, so "José" matches "jose". */
const normalize = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

const nameOf = (person: Presence) => person.displayName ?? "Someone";

/**
 * People on campus now and the spaces on the map, matched by name. An empty
 * query matches everything, so the screen opens on the whole campus.
 */
export function searchCampus(
  world: Pick<WorldState, "players" | "spaces" | "selfId" | "lockedSpaces">,
  query: string,
): SearchResults {
  const q = normalize(query);
  const matches = (text: string) => q === "" || normalize(text).includes(q);
  const others = Object.values(world.players).filter(
    (person) => person.userId !== world.selfId,
  );

  const people = others
    .filter((person) => matches(nameOf(person)))
    .sort((a, b) => nameOf(a).localeCompare(nameOf(b)))
    .map((person) => ({
      type: "people" as const,
      data: {
        id: person.userId,
        name: nameOf(person),
        status: person.status,
        spaceName: world.spaces[person.spaceKey]?.name,
      },
    }));

  const everyone = Object.values(world.players);
  const spaces = Object.values(world.spaces)
    // The corridors aren't somewhere you'd look for.
    .filter((space) => space.spaceKey !== "_default" && matches(space.name))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((space) => ({
      type: "spaces" as const,
      data: {
        id: space.spaceKey,
        name: space.name,
        people: everyone.filter((p) => p.spaceKey === space.spaceKey).length,
        locked: world.lockedSpaces.includes(space.spaceKey),
      },
    }));

  return { people, spaces };
}
