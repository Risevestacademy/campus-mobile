import { create } from "zustand";
import { combine } from "zustand/middleware";

import type {
  ProfileField,
  ProfileFields,
  ProfileSchema,
  UpdateProfileSchema,
} from "../types";

const FIELDS: ProfileField[] = [
  "firstName",
  "lastName",
  "displayName",
  "phone",
  "bio",
];

const EMPTY: ProfileFields = {
  firstName: "",
  lastName: "",
  displayName: "",
  phone: "",
  bio: "",
};

const fromProfile = (profile: ProfileSchema): ProfileFields => ({
  firstName: profile.firstName ?? "",
  lastName: profile.lastName ?? "",
  displayName: profile.displayName ?? "",
  phone: profile.phone ?? "",
  bio: profile.bio ?? "",
});

const changedFields = (initial: ProfileFields, draft: ProfileFields) =>
  FIELDS.filter((field) => initial[field] !== draft[field]);

export const useProfileUpdateStore = create(
  combine({ initial: EMPTY, draft: EMPTY }, (set, get) => ({
    /** Seeds the form from the server, without clobbering unsaved edits. */
    hydrate: (profile: ProfileSchema) => {
      const { initial, draft } = get();
      const next = fromProfile(profile);
      const hasEdits = changedFields(initial, draft).length > 0;

      set({ initial: next, draft: hasEdits ? draft : next });
    },

    setField: (field: ProfileField, value: string) =>
      set((state) => ({ draft: { ...state.draft, [field]: value } })),

    reset: () => set({ initial: EMPTY, draft: EMPTY }),

    /** Only the fields that differ from the server, ready for PATCH /v1/users/me. */
    getChanges: (): UpdateProfileSchema => {
      const { initial, draft } = get();
      return Object.fromEntries(
        changedFields(initial, draft).map((field) => [
          field,
          draft[field] === "" ? null : draft[field],
        ]),
      );
    },
  })),
);

export const useHasProfileChanges = () =>
  useProfileUpdateStore(
    (state) => changedFields(state.initial, state.draft).length > 0,
  );
