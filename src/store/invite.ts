import { create } from "zustand";
import { combine } from "zustand/middleware";

import type { components } from "../core/api/generated/schema";

export type InvitePreviewData =
  components["schemas"]["InvitePreviewResponseDto"];
export type InviteOnboardingData =
  components["schemas"]["InviteOnboardingResponseDto"];

export type InviteDetails = InvitePreviewData | InviteOnboardingData;

const initialState = {
  inviteId: null as string | null,
  inviteDetails: null as InviteDetails | null,
};

export const useInviteStore = create(
  combine(initialState, (set) => ({
    setInvite: ({
      inviteId,
      inviteDetails,
    }: {
      inviteId: string | null;
      inviteDetails: InviteDetails | null;
    }) => set({ inviteId, inviteDetails }),
    reset: () => set(initialState),
  })),
);
