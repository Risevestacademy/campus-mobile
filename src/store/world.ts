import type { Avatar, SpaceName } from "@shared/lib/generated/world-protocol";
import type { ServerMessage } from "@shared/lib/ws";
import { create } from "zustand";
import { combine } from "zustand/middleware";

/**
 * Who is on campus, kept from `snapshot` plus the deltas after it. Positions
 * are left out on purpose: `moved` arrives every tick and would re-render
 * everything reading this store.
 */
export type Presence = Pick<
  Avatar,
  "userId" | "displayName" | "status" | "spaceKey"
>;

export type WorldState = {
  /** False until the first snapshot, and again while the socket is down. */
  ready: boolean;
  selfId: string | null;
  players: Record<string, Presence>;
  spaces: Record<string, SpaceName>;
};

const initialState: WorldState = {
  ready: false,
  selfId: null,
  players: {},
  spaces: {},
};

function toPresence({ userId, displayName, status, spaceKey }: Avatar) {
  return { userId, displayName, status, spaceKey };
}

/** Ignores unknown users, so a late update can't bring back someone who left. */
function patch(
  state: WorldState,
  userId: string,
  changes: Partial<Presence>,
): WorldState {
  const player = state.players[userId];
  if (!player) return state;
  return {
    ...state,
    players: { ...state.players, [userId]: { ...player, ...changes } },
  };
}

export function applyWorldMessage(
  state: WorldState,
  message: ServerMessage,
): WorldState {
  switch (message.type) {
    case "welcome":
      return { ...state, selfId: message.userId };
    case "snapshot":
      return {
        ...state,
        ready: true,
        players: Object.fromEntries(
          message.players.map((p) => [p.userId, toPresence(p)]),
        ),
        spaces: Object.fromEntries(message.spaces.map((s) => [s.spaceKey, s])),
      };
    case "joined":
      return {
        ...state,
        players: {
          ...state.players,
          [message.player.userId]: toPresence(message.player),
        },
      };
    case "left": {
      if (!state.players[message.userId]) return state;
      const { [message.userId]: _left, ...players } = state.players;
      return { ...state, players };
    }
    case "statusChanged":
      return patch(state, message.userId, { status: message.status });
    case "spaceChanged":
      return patch(state, message.userId, { spaceKey: message.spaceKey });
    case "appearance":
      return patch(state, message.userId, {
        displayName: message.displayName,
      });
    case "replaced":
      return initialState;
    default:
      return state;
  }
}

export const useWorldStore = create(
  combine(initialState, (set) => ({
    apply: (message: ServerMessage) =>
      set((state) => applyWorldMessage(state, message)),
    /** Keeps the last list on screen until the next snapshot replaces it. */
    markStale: () => set({ ready: false }),
    reset: () => set(initialState),
  })),
);

export const useCampusCount = () =>
  useWorldStore((state) => Object.keys(state.players).length);

export const useWorldReady = () => useWorldStore((state) => state.ready);

export const useMySpace = () =>
  useWorldStore((state) => {
    const key = state.selfId
      ? state.players[state.selfId]?.spaceKey
      : undefined;
    if (!key) return undefined;
    return state.spaces[key];
  });

export const useMyStatus = () =>
  useWorldStore((state) =>
    state.selfId ? state.players[state.selfId]?.status : undefined,
  );
