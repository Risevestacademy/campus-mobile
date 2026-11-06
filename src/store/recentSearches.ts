import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

const RECENT_SEARCHES_KEY = "recent_searches";
/** How many to keep, newest first. */
export const MAX_RECENT_SEARCHES = 5;

const isQueries = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

type RecentSearchesStore = {
  queries: string[];
  hydrated: boolean;

  hydrate: () => Promise<void>;
  add: (query: string) => void;
  remove: (query: string) => void;
  clear: () => void;
};

const persist = (queries: string[]) =>
  SecureStore.setItemAsync(RECENT_SEARCHES_KEY, JSON.stringify(queries)).catch(
    (error) => console.error("Failed to persist recent searches:", error),
  );

/** Searches you've run on this device, kept between launches. */
export const useRecentSearchesStore = create<RecentSearchesStore>(
  (set, get) => ({
    queries: [],
    hydrated: false,

    hydrate: async () => {
      if (get().hydrated) return;
      try {
        const stored = await SecureStore.getItemAsync(RECENT_SEARCHES_KEY);
        const parsed: unknown = stored ? JSON.parse(stored) : [];
        // Anything added while reading goes first.
        const queries = isQueries(parsed) ? parsed : [];
        set((state) => ({
          hydrated: true,
          queries: dedupe([...state.queries, ...queries]),
        }));
      } catch (error) {
        console.error("Failed to hydrate recent searches:", error);
        set({ hydrated: true });
      }
    },

    add: (query) => {
      const trimmed = query.trim();
      if (!trimmed) return;
      const queries = dedupe([trimmed, ...get().queries]);
      set({ queries });
      void persist(queries);
    },

    remove: (query) => {
      const queries = get().queries.filter((item) => item !== query);
      set({ queries });
      void persist(queries);
    },

    clear: () => {
      set({ queries: [] });
      void persist([]);
    },
  }),
);

/** The same search in another case counts once, keeping the newest. */
function dedupe(queries: string[]) {
  const seen = new Set<string>();
  return queries
    .filter((query) => {
      const key = query.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, MAX_RECENT_SEARCHES);
}
