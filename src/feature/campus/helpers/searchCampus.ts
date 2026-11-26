import type { Presence, WorldState } from "@store/world";

import type { CohortPerson, PersonResult, SearchResults } from "../types";

/** Lower case, without accents, so "José" matches "jose". */
const normalize = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

const nameOf = (person: { displayName: string | null }) =>
  person.displayName ?? "Someone";

/**
 * Everybody in your cohort and the spaces on the map, matched by name. World
 * says who of them is on campus, and where; they come first. Anybody world
 * has that the cohort list doesn't (yet) is still found. An empty query
 * matches everything, so the screen opens on the whole cohort.
 */
export function searchCampus(
  world: Pick<WorldState, "players" | "spaces" | "selfId" | "lockedSpaces">,
  query: string,
  cohort: CohortPerson[] = [],
): SearchResults {
  const q = normalize(query);
  const matches = (text: string) => q === "" || normalize(text).includes(q);

  const byId = new Map<string, PersonResult>();
  for (const member of cohort) {
    byId.set(member.id, {
      id: member.id,
      name: nameOf(member),
      onCampus: false,
    });
  }
  for (const player of Object.values(world.players) as Presence[]) {
    byId.set(player.userId, {
      id: player.userId,
      name: nameOf(player),
      onCampus: true,
      status: player.status,
      spaceName: world.spaces[player.spaceKey]?.name,
    });
  }
  if (world.selfId) byId.delete(world.selfId);

  const people = [...byId.values()]
    .filter((person) => matches(person.name))
    .sort(
      (a, b) =>
        Number(b.onCampus) - Number(a.onCampus) || a.name.localeCompare(b.name),
    )
    .map((data) => ({ type: "people" as const, data }));

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
