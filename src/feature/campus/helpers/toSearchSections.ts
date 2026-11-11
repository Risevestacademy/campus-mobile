import type {
  SearchFilter,
  SearchResult,
  SearchResults,
  SearchSection,
} from "../types";
import { RESULT_TYPES } from "./searchFilters";

/** All shows every type with results, in order; a type shows only itself. */
export function toSearchSections(
  results: SearchResults,
  filter: SearchFilter,
): SearchSection[] {
  return RESULT_TYPES.filter(({ key }) => filter === "all" || filter === key)
    .map(({ key, label }) => ({
      type: key,
      title: label,
      data: (results[key] ?? []) as SearchResult[],
    }))
    .filter((section) => section.data.length > 0);
}

/** Unique across types, since ids from different types can clash. */
export const searchResultKey = (result: SearchResult) =>
  `${result.type}:${result.data.id}`;
