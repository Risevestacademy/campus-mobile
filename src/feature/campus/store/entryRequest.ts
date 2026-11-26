import { create } from "zustand";

/**
 * walking: on the way to the door. waiting: asked, for somebody inside to
 * answer. entering: let in, walking through. ended: over without getting
 * in; `reason` says why.
 */
export type EntryRequestPhase = "walking" | "waiting" | "entering" | "ended";

export type EntryRequest = {
  spaceKey: string;
  spaceName: string;
  phase: EntryRequestPhase;
  /** World's id for it, once `entryRequested` names it. */
  requestId: string | null;
  reason: string | null;
  /** Cancel was tapped before world named the request: withdraw it then. */
  cancelling: boolean;
};

type EntryRequestState = {
  /** World takes one request at a time, so there's one here. */
  request: EntryRequest | null;
  start: (spaceKey: string, spaceName: string) => void;
  update: (changes: Partial<EntryRequest>) => void;
  clear: () => void;
};

/**
 * Your request to enter a locked space. It outlives the screens: you can
 * leave the lobby, and the answer still arrives and is acted on.
 */
export const useEntryRequestStore = create<EntryRequestState>((set) => ({
  request: null,
  start: (spaceKey, spaceName) =>
    set({
      request: {
        spaceKey,
        spaceName,
        phase: "walking",
        requestId: null,
        reason: null,
        cancelling: false,
      },
    }),
  update: (changes) =>
    set((state) =>
      state.request ? { request: { ...state.request, ...changes } } : state,
    ),
  clear: () => set({ request: null }),
}));

/** The request for `spaceKey`, if it's the one you have open. */
export const useEntryRequestFor = (spaceKey: string) =>
  useEntryRequestStore((state) =>
    state.request?.spaceKey === spaceKey ? state.request : null,
  );
