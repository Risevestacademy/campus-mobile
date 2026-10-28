import type { Avatar } from "@shared/lib/generated/world-protocol";
import type { ServerMessage } from "@shared/lib/ws";
import { useWorldStore } from "@store/world";

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
  return { type: "snapshot", players } as unknown as ServerMessage;
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
