import {
  MAX_RECENT_SEARCHES,
  useRecentSearchesStore,
} from "@store/recentSearches";
import * as SecureStore from "expo-secure-store";

const state = () => useRecentSearchesStore.getState();

describe("useRecentSearchesStore", () => {
  beforeEach(async () => {
    useRecentSearchesStore.setState({ queries: [], hydrated: false });
    await SecureStore.deleteItemAsync("recent_searches");
  });

  it("keeps the newest first, once each whatever the case", () => {
    state().add("Ada");
    state().add("library");
    state().add("ada");

    expect(state().queries).toEqual(["ada", "library"]);
  });

  it("ignores blank searches and trims the rest", () => {
    state().add("   ");
    state().add("  studio ");

    expect(state().queries).toEqual(["studio"]);
  });

  it("keeps only the most recent few", () => {
    for (let i = 0; i < MAX_RECENT_SEARCHES + 2; i += 1) state().add(`q${i}`);

    expect(state().queries).toHaveLength(MAX_RECENT_SEARCHES);
    expect(state().queries[0]).toBe(`q${MAX_RECENT_SEARCHES + 1}`);
  });

  it("comes back after a restart", async () => {
    state().add("ada");
    await Promise.resolve();
    useRecentSearchesStore.setState({ queries: [], hydrated: false });

    await state().hydrate();

    expect(state().queries).toEqual(["ada"]);
  });

  it("removes one, or clears them all", () => {
    state().add("ada");
    state().add("library");

    state().remove("ada");
    expect(state().queries).toEqual(["library"]);

    state().clear();
    expect(state().queries).toEqual([]);
  });
});
