import type { Status } from "@shared/lib/generated/world-protocol";

export type SearchFilter =
  "all" | "people" | "spaces" | "meetings" | "resources";

/** What a result can be: every filter but All. */
export type SearchResultType = Exclude<SearchFilter, "all">;

/** Somebody on campus now, from the world socket. */
export type PersonResult = {
  id: string;
  name: string;
  status: Status;
  /** The space they're standing in, by name. */
  spaceName?: string;
};
/** A drawn space on the map, and how many are in it now. */
export type SpaceResult = {
  id: string;
  name: string;
  people: number;
  /** Locked in your cohort right now. */
  locked: boolean;
};
// WIP: placeholder shapes until there's something to search for these.
export type MeetingResult = { id: string; title: string; when: string };
export type ResourceResult = { id: string; title: string; kind: string };

/** One result, with `data` shaped by its `type`. */
export type SearchResult =
  | { type: "people"; data: PersonResult }
  | { type: "spaces"; data: SpaceResult }
  | { type: "meetings"; data: MeetingResult }
  | { type: "resources"; data: ResourceResult };

/** Results grouped by type; a type with none can be left out. */
export type SearchResults = {
  [T in SearchResultType]?: Extract<SearchResult, { type: T }>[];
};

/** One heading and its results, as the SectionList takes them. */
export type SearchSection = {
  type: SearchResultType;
  title: string;
  data: SearchResult[];
};

/** A meeting on now, from your calendar. */
/** Where joining a calendar event takes you. */
export type MeetingJoinTarget =
  /** A room link to a space in your cohort's campus. */
  | { kind: "campus"; code: string; spaceKey: string; spaceName: string }
  /** A video call outside campus, e.g. Google Meet. */
  | { kind: "external"; url: string };

export type LiveMeetingItem = {
  id: string;
  title: string;
  location: string;
  /** ISO timestamp. */
  startsAt: string;
  /** Null when there's nowhere to join it. */
  join: MeetingJoinTarget | null;
};

export type QuickAction = {
  key: "newMeeting" | "myDesk" | "classroom";
  label: string;
};

/** What the search screen shows before you type. */
export type SearchHomeItem =
  | { type: "live"; data: LiveMeetingItem }
  | { type: "recent"; data: { query: string } }
  // All quick actions are one item, laid out in a row.
  | { type: "actions"; data: QuickAction[] };

export type SearchHomeSection = {
  key: "live" | "recent" | "actions";
  title: string;
  data: SearchHomeItem[];
};
