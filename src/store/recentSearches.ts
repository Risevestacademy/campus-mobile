import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

const RECENT_SEARCHES_KEY = "recent_searches";
/** How many to keep, newest first. */
export const MAX_RECENT_SEARCHES = 5;

const isQueries = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

/**
 * Changes made before the saved list was read. They're applied to it once it
 * is, and the result saved, so neither the old searches nor the new are lost.
 */
type EarlyChanges = {
  cleared: boolean;
  removed: string[];
};

type RecentSearchesStore = {
  queries: string[];
  hydrated: boolean;
  earlyChanges: EarlyChanges | null;
  loading: Promise<void> | null;

  hydrate: () => Promise<void>;
  add: (query: string) => void;
  remove: (query: string) => void;
  clear: () => void;
};

const persist = (queries: string[]) =>
  SecureStore.setItemAsync(RECENT_SEARCHES_KEY, JSON.stringify(queries)).catch(
    (error) => console.error("Failed to persist recent searches:", error),
  );

async function readSaved(): Promise<string[]> {
  try {
    const stored = await SecureStore.getItemAsync(RECENT_SEARCHES_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    return isQueries(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to hydrate recent searches:", error);
    return [];
  }
}

const NO_CHANGES: EarlyChanges = { cleared: false, removed: [] };

/** Searches you've run on this device, kept between launches. */
export const useRecentSearchesStore = create<RecentSearchesStore>(
  (set, get) => {
    /** Notes a change made before hydration finished. */
    const noteEarly = (change: (early: EarlyChanges) => EarlyChanges) => {
      if (get().hydrated) return;
      set((state) => ({
        earlyChanges: change(state.earlyChanges ?? NO_CHANGES),
      }));
    };

    const load = async () => {
      const saved = await readSaved();
      const early = get().earlyChanges;
      const kept = early?.cleared
        ? []
        : saved.filter(
            (query) => !early?.removed.includes(query.toLowerCase()),
          );
      // Anything added while reading goes first.
      set((state) => ({
        hydrated: true,
        loading: null,
        earlyChanges: null,
        queries: dedupe([...state.queries, ...kept]),
      }));
      if (early) await persist(get().queries);
    };

    return {
      queries: [],
      hydrated: false,
      earlyChanges: null,
      loading: null,

      hydrate: () => {
        const { hydrated, loading } = get();
        if (hydrated) return Promise.resolve();
        if (loading) return loading;
        const next = load();
        set({ loading: next });
        return next;
      },

      add: (query) => {
        const trimmed = query.trim();
        if (!trimmed) return;
        const queries = dedupe([trimmed, ...get().queries]);
        set({ queries });
        noteEarly((early) => early);
        void persist(queries);
      },

      remove: (query) => {
        const queries = get().queries.filter((item) => item !== query);
        set({ queries });
        noteEarly((early) => ({
          ...early,
          removed: [...early.removed, query.toLowerCase()],
        }));
        void persist(queries);
      },

      clear: () => {
        set({ queries: [] });
        noteEarly(() => ({ cleared: true, removed: [] }));
        void persist([]);
      },
    };
  },
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
