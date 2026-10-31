import type { Avatar, SpaceName } from "@shared/lib/generated/world-protocol";
import type { ServerMessage } from "@shared/lib/ws";
import { useAroundMe, useMySpace, useWorldStore } from "@store/world";
import { act, renderHook } from "@testing-library/react-native";

function avatar(userId: string, overrides: Partial<Avatar> = {}): Avatar {
  return {
    userId,
    x: 0,
    y: 0,
    facing: "down",
    displayName: userId,
    spriteKey: null,
    status: "available",
    spaceKey: "_default",
    ...overrides,
  };
}

// Only the fields the store reads; the map is irrelevant to presence.
function snapshot(...players: Avatar[]) {
  return snapshotWithSpaces([], ...players);
}

function snapshotWithSpaces(spaces: SpaceName[], ...players: Avatar[]) {
  return { type: "snapshot", players, spaces } as unknown as ServerMessage;
}

const apply = (message: ServerMessage) =>
  useWorldStore.getState().apply(message);
const state = () => useWorldStore.getState();
const count = () => Object.keys(state().players).length;

describe("useWorldStore", () => {
  beforeEach(() => {
    useWorldStore.getState().reset();
  });

  it("is not ready and empty before the first snapshot", () => {
    expect(state().ready).toBe(false);
    expect(count()).toBe(0);
  });

  it("takes everybody from the snapshot and keeps your own id", () => {
    apply({ type: "welcome", userId: "me" } as ServerMessage);
    apply(snapshot(avatar("me"), avatar("a"), avatar("b")));

    expect(state().ready).toBe(true);
    expect(state().selfId).toBe("me");
    expect(count()).toBe(3);
  });

  it("drops positions so movement doesn't touch the store", () => {
    apply(snapshot(avatar("a", { x: 4, y: 7 })));

    expect(state().players.a).toEqual({
      userId: "a",
      displayName: "a",
      status: "available",
      spaceKey: "_default",
    });

    const before = state();
    apply({ type: "moved", players: [] } as unknown as ServerMessage);
    expect(state()).toBe(before);
  });

  it("adds people who join and removes people who leave", () => {
    apply(snapshot(avatar("a")));
    apply({ type: "joined", player: avatar("b") });
    expect(count()).toBe(2);

    apply({ type: "left", userId: "a" });
    expect(Object.keys(state().players)).toEqual(["b"]);
  });

  it("counts somebody who joins twice once", () => {
    apply(snapshot(avatar("a")));
    apply({ type: "joined", player: avatar("b") });
    apply({ type: "joined", player: avatar("b", { status: "busy" }) });

    expect(count()).toBe(2);
    expect(state().players.b?.status).toBe("busy");
  });

  it("ignores a leave for somebody it doesn't know", () => {
    apply(snapshot(avatar("a")));
    const before = state();

    apply({ type: "left", userId: "ghost" });

    expect(state()).toBe(before);
  });

  it("updates status, space and name for known people only", () => {
    apply(snapshot(avatar("a")));

    apply({ type: "statusChanged", userId: "a", status: "away" });
    apply({ type: "spaceChanged", userId: "a", spaceKey: "library" });
    apply({
      type: "appearance",
      userId: "a",
      displayName: "Ada",
    } as ServerMessage);
    apply({ type: "statusChanged", userId: "ghost", status: "busy" });

    expect(state().players.a).toMatchObject({
      status: "away",
      spaceKey: "library",
      displayName: "Ada",
    });
    expect(state().players.ghost).toBeUndefined();
  });

  it("replaces everybody on a new snapshot after a reconnect", () => {
    apply(snapshot(avatar("a"), avatar("b")));
    useWorldStore.getState().markStale();
    expect(state().ready).toBe(false);
    expect(count()).toBe(2);

    apply(snapshot(avatar("c")));

    expect(state().ready).toBe(true);
    expect(Object.keys(state().players)).toEqual(["c"]);
  });

  it("clears everything when the account opens campus elsewhere", () => {
    apply({ type: "welcome", userId: "me" } as ServerMessage);
    apply(snapshot(avatar("me")));

    apply({ type: "replaced" });

    expect(state()).toMatchObject({ ready: false, selfId: null, players: {} });
  });
});

describe("useMySpace", () => {
  const library = { spaceKey: "library", name: "Library" };

  beforeEach(() => {
    useWorldStore.getState().reset();
  });

  it("names the space you're standing in", async () => {
    const { result } = await renderHook(() => useMySpace());

    await act(() => {
      apply({ type: "welcome", userId: "me" } as ServerMessage);
      apply(
        snapshotWithSpaces([library], avatar("me", { spaceKey: "library" })),
      );
    });

    expect(result.current).toEqual(library);
  });

  it("follows you into another space", async () => {
    const lounge = { spaceKey: "lounge", name: "Main Lounge" };
    const { result } = await renderHook(() => useMySpace());

    await act(() => {
      apply({ type: "welcome", userId: "me" } as ServerMessage);
      apply(
        snapshotWithSpaces(
          [library, lounge],
          avatar("me", { spaceKey: "library" }),
        ),
      );
      apply({ type: "spaceChanged", userId: "me", spaceKey: "lounge" });
    });

    expect(result.current).toEqual(lounge);
  });

  it("picks up a rename sent after the snapshot", async () => {
    const { result } = await renderHook(() => useMySpace());

    await act(() => {
      apply({ type: "welcome", userId: "me" } as ServerMessage);
      apply(
        snapshotWithSpaces([library], avatar("me", { spaceKey: "library" })),
      );
      apply({
        type: "spaces",
        spaces: [{ spaceKey: "library", name: "Reading Room" }],
      });
    });

    expect(result.current).toEqual({
      spaceKey: "library",
      name: "Reading Room",
    });
  });

  it("is undefined for a space the snapshot didn't name", async () => {
    const { result } = await renderHook(() => useMySpace());

    await act(() => {
      apply({ type: "welcome", userId: "me" } as ServerMessage);
      apply(snapshotWithSpaces([library], avatar("me")));
    });

    expect(result.current).toBeUndefined();
  });

  it("is undefined before world says who you are", async () => {
    apply(snapshotWithSpaces([library], avatar("me", { spaceKey: "library" })));

    const { result } = await renderHook(() => useMySpace());

    expect(result.current).toBeUndefined();
  });
});

describe("useAroundMe", () => {
  const library = { spaceKey: "library", name: "Library" };
  const inLibrary = (id: string, overrides: Partial<Avatar> = {}) =>
    avatar(id, { spaceKey: "library", ...overrides });

  beforeEach(() => {
    useWorldStore.getState().reset();
    apply({ type: "welcome", userId: "me" } as ServerMessage);
    apply(
      snapshotWithSpaces(
        [library],
        inLibrary("me"),
        inLibrary("ada"),
        inLibrary("bo", { status: "busy" }),
        avatar("cy", { spaceKey: "lounge" }),
      ),
    );
  });

  it("lists everyone else in your space while nobody is in earshot", async () => {
    const { result } = await renderHook(() => useAroundMe());

    expect(result.current.space).toEqual(library);
    expect(result.current.earshot).toEqual([]);
    expect(result.current.inMySpace.map((p) => p.userId).sort()).toEqual([
      "ada",
      "bo",
    ]);
  });

  it("groups whoever is in earshot, leaving you and them out of the rest", async () => {
    const { result } = await renderHook(() => useAroundMe());

    await act(() => {
      apply({ type: "nearby", userIds: ["me", "ada"] });
    });

    expect(result.current.earshot.map((p) => p.userId)).toEqual(["ada"]);
    expect(result.current.inMySpace.map((p) => p.userId)).toEqual(["bo"]);
  });

  it("forgets earshot when you move to another space", async () => {
    const { result } = await renderHook(() => useAroundMe());

    await act(() => {
      apply({ type: "nearby", userIds: ["ada"] });
      apply({ type: "spaceChanged", userId: "me", spaceKey: "lounge" });
    });

    expect(state().nearby).toEqual([]);
    expect(result.current.earshot).toEqual([]);
    expect(result.current.inMySpace.map((p) => p.userId)).toEqual(["cy"]);
  });

  it("keeps earshot when somebody else moves", async () => {
    await act(() => {
      apply({ type: "nearby", userIds: ["ada"] });
      apply({ type: "spaceChanged", userId: "bo", spaceKey: "lounge" });
    });

    expect(state().nearby).toEqual(["ada"]);
  });

  it("skips earshot ids world hasn't told us about", async () => {
    const { result } = await renderHook(() => useAroundMe());

    await act(() => {
      apply({ type: "nearby", userIds: ["ghost", "ada"] });
    });

    expect(result.current.earshot.map((p) => p.userId)).toEqual(["ada"]);
  });
});
