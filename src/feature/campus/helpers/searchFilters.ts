import type { SearchFilter, SearchResultType } from "../types";

export const SEARCH_FILTERS: { key: SearchFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "people", label: "People" },
  { key: "spaces", label: "Spaces" },
  { key: "meetings", label: "Meetings" },
  { key: "resources", label: "Resources" },
];

/** Section order under All, and each section's heading. */
export const RESULT_TYPES = SEARCH_FILTERS.filter(
  (filter): filter is { key: SearchResultType; label: string } =>
    filter.key !== "all",
);
