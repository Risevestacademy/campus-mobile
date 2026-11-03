import { create } from "zustand";

export type FeedbackPill = {
  id: number;
  message: string;
  action?: { text: string; onPress: () => void };
};

/** How long the pill stays up. */
const PILL_MS = 2000;

export const useFeedbackPill = create<{ pill: FeedbackPill | null }>(() => ({
  pill: null,
}));

let lastId = 0;
let timer: ReturnType<typeof setTimeout> | undefined;

export function hidePill() {
  clearTimeout(timer);
  useFeedbackPill.setState({ pill: null });
}

/**
 * Shows the success pill for 2 s. It sits outside the toast queue, so it
 * never waits behind a card; a new one replaces the one up.
 */
export function showPill(message: string, action?: FeedbackPill["action"]) {
  clearTimeout(timer);
  useFeedbackPill.setState({ pill: { id: ++lastId, message, action } });
  timer = setTimeout(hidePill, PILL_MS);
}
