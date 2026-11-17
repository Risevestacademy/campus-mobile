import { useRecentSearchesStore } from "@store/recentSearches";
import React from "react";

/** Your recent searches, read from the device the first time they're needed. */
export function useRecentSearches() {
  const store = useRecentSearchesStore();

  React.useEffect(() => {
    void useRecentSearchesStore.getState().hydrate();
  }, []);

  return {
    queries: store.queries,
    add: store.add,
    remove: store.remove,
    clear: store.clear,
  };
}
