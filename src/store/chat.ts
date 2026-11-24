import type { ServerMessage } from "@shared/lib/ws";
import { create } from "zustand";
import { combine } from "zustand/middleware";

/** One line of chat, as world relayed it. */
export type ChatLine = {
  id: string;
  userId: string;
  text: string;
  /** When world relayed it, as an ISO timestamp. */
  at: string;
};

/** Enough for a long conversation; older lines fall off the front. */
export const MAX_CHAT_LINES = 200;

export type ChatState = {
  /** Oldest first. World keeps none, so this is only what arrived here. */
  lines: ChatLine[];
  /** Lines from other people that arrived while the chat was closed. */
  unread: number;
  open: boolean;
};

const initialState: ChatState = { lines: [], unread: 0, open: false };

/**
 * Applies a `said` line. The world store's `selfId` is passed in so your own
 * echo never counts as unread.
 */
export function applySaid(
  state: ChatState,
  message: Extract<ServerMessage, { type: "said" }>,
  selfId: string | null,
): ChatState {
  if (state.lines.some((line) => line.id === message.id)) return state;
  const line: ChatLine = {
    id: message.id,
    userId: message.userId,
    text: message.text,
    at: message.at,
  };
  const fromOther = message.userId !== selfId;
  return {
    ...state,
    lines: [...state.lines, line].slice(-MAX_CHAT_LINES),
    unread: fromOther && !state.open ? state.unread + 1 : state.unread,
  };
}

export const useChatStore = create(
  combine(initialState, (set) => ({
    say: (
      message: Extract<ServerMessage, { type: "said" }>,
      selfId: string | null,
    ) => set((state) => applySaid(state, message, selfId)),
    /** Opening reads everything; the chat is per space, so leaving ends it. */
    setOpen: (open: boolean) =>
      set((state) => ({ open, unread: open ? 0 : state.unread })),
    /** A new space: its chat starts empty. Keeps whether the sheet is open. */
    clear: () => set({ lines: [], unread: 0 }),
    reset: () => set(initialState),
  })),
);

export const useChatUnread = () => useChatStore((state) => state.unread);
