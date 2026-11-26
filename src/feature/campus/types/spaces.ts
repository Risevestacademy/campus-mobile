/**
 * private: a room whoever is inside may lock. common: an open area. World
 * doesn't say what a space is for; that's admin-only on campus-api.
 */
export type SpaceType = "private" | "common";

/**
 * live: a meeting on your calendar is being held there now. locked: shut in
 * your cohort right now. occupied / empty: by people in it. The first that
 * applies wins.
 */
export type SpaceStatus = "live" | "locked" | "occupied" | "empty";

/** A space on the map, as the spaces list shows it. */
export type Space = {
  /** The world `spaceKey`: what to open or walk to. */
  key: string;
  title: string;
  /** Who is in it, and whether it's locked. */
  subtitle: string;
  /** Names of the people in it, for search. */
  people: string[];
  /** The meeting on there now, when it's live. */
  meeting?: string;
  participants: number;
  status: SpaceStatus;
  type: SpaceType;
};

export type SpaceFilter = "all" | SpaceStatus;
