import {
  MAX_RECENT_SEARCHES,
  useRecentSearchesStore,
} from "@store/recentSearches";
import * as SecureStore from "expo-secure-store";

const state = () => useRecentSearchesStore.getState();

describe("useRecentSearchesStore", () => {
  beforeEach(async () => {
    useRecentSearchesStore.setState(useRecentSearchesStore.getInitialState());
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
    useRecentSearchesStore.setState(useRecentSearchesStore.getInitialState());

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

  describe("changes made while the saved searches are still being read", () => {
    const saved = async () =>
      JSON.parse((await SecureStore.getItemAsync("recent_searches")) ?? "[]");

    /** Reads what's saved now, but answers only once `finish` is called. */
    function delayRead() {
      let finish!: () => void;
      const gate = new Promise<void>((resolve) => (finish = resolve));
      const real = jest.requireMock("expo-secure-store").getItemAsync;
      const original = real.getMockImplementation();
      real.mockImplementationOnce(async (key: string) => {
        const value = await original(key);
        await gate;
        return value;
      });
      return finish;
    }

    beforeEach(async () => {
      await SecureStore.setItemAsync("recent_searches", JSON.stringify(["a"]));
    });

    it("saves the new search and the old ones together", async () => {
      const finish = delayRead();
      const hydrating = state().hydrate();
      state().add("b");

      finish();
      await hydrating;

      expect(state().queries).toEqual(["b", "a"]);
      expect(await saved()).toEqual(["b", "a"]);
    });

    it("doesn't bring back one removed meanwhile", async () => {
      const finish = delayRead();
      const hydrating = state().hydrate();
      state().remove("A");

      finish();
      await hydrating;

      expect(state().queries).toEqual([]);
      expect(await saved()).toEqual([]);
    });

    it("drops the saved ones when cleared meanwhile", async () => {
      const finish = delayRead();
      const hydrating = state().hydrate();
      state().clear();
      state().add("b");

      finish();
      await hydrating;

      expect(state().queries).toEqual(["b"]);
      expect(await saved()).toEqual(["b"]);
    });

    it("reads once when asked twice", async () => {
      const finish = delayRead();
      const first = state().hydrate();
      const second = state().hydrate();

      finish();
      await Promise.all([first, second]);

      expect(state().queries).toEqual(["a"]);
    });
  });
});
