import type { Avatar, SpaceName } from "@shared/lib/generated/world-protocol";
import type { ServerMessage } from "@shared/lib/ws";
import React from "react";
import { create } from "zustand";
import { combine } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

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
  /** Who is close enough to hear you, in a proximity space; else empty. */
  nearby: string[];
};

const initialState: WorldState = {
  ready: false,
  selfId: null,
  players: {},
  spaces: {},
  nearby: [],
};

function toPresence({ userId, displayName, status, spaceKey }: Avatar) {
  return { userId, displayName, status, spaceKey };
}

function bySpaceKey(spaces: SpaceName[]) {
  return Object.fromEntries(spaces.map((space) => [space.spaceKey, space]));
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
  console.warn(message);
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
        spaces: bySpaceKey(message.spaces),
        // A new connection: world sends `nearby` again if it applies.
        nearby: [],
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
    case "spaceChanged": {
      const next = patch(state, message.userId, { spaceKey: message.spaceKey });
      // Earshot belongs to the space you were in; a new one sends its own.
      return message.userId === state.selfId ? { ...next, nearby: [] } : next;
    }
    case "nearby":
      return { ...state, nearby: message.userIds };
    case "appearance":
      return patch(state, message.userId, {
        displayName: message.displayName,
      });
    case "spaces":
      return { ...state, spaces: bySpaceKey(message.spaces) };
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

/**
 * Who is around you: everyone within earshot as one conversation, and
 * everyone else standing in your space. You're never in either list.
 */
export function useAroundMe() {
  const { players, nearby, selfId, spaces } = useWorldStore(
    useShallow((state) => ({
      players: state.players,
      nearby: state.nearby,
      selfId: state.selfId,
      spaces: state.spaces,
    })),
  );

  return React.useMemo(() => {
    const me = selfId ? players[selfId] : undefined;
    const earshot = nearby
      .filter((id) => id !== selfId)
      .map((id) => players[id])
      .filter((player): player is Presence => player !== undefined);
    const heard = new Set(earshot.map((player) => player.userId));
    const inMySpace = me
      ? Object.values(players).filter(
          (player) =>
            player.userId !== selfId &&
            player.spaceKey === me.spaceKey &&
            !heard.has(player.userId),
        )
      : [];

    return {
      space: me ? spaces[me.spaceKey] : undefined,
      earshot,
      inMySpace,
    };
  }, [players, nearby, selfId, spaces]);
}
