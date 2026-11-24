import type { Room } from "livekit-client";
import { create } from "zustand";

type BroadcastState = {
  /** The connected broadcast room, for an admin to publish into. */
  room: Room | null;
  /** May publish a microphone here: you're an admin. */
  canSpeak: boolean;
  /** User ids of everybody else broadcasting now. */
  speakers: string[];
  /** Your own microphone is live in the broadcast room. */
  speaking: boolean;
};

const initialState: BroadcastState = {
  room: null,
  canSpeak: false,
  speakers: [],
  speaking: false,
};

/**
 * What the broadcast room is doing, for UI that lives outside it: the banner,
 * and the space call that goes quieter underneath. Written only by the room.
 */
export const useBroadcastStore = create<
  BroadcastState & {
    sync: (next: Partial<BroadcastState>) => void;
    reset: () => void;
  }
>((set) => ({
  ...initialState,
  sync: (next) => set(next),
  reset: () => set(initialState),
}));

/** Somebody else is broadcasting: play them over the space call. */
export const useBroadcastLive = () =>
  useBroadcastStore((state) => state.speakers.length > 0);
