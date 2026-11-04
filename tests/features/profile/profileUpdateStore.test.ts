import { useProfileUpdateStore } from "@features/profile/store";
import type { ProfileSchema } from "@features/profile/types";

const profile = {
  firstName: "Ada",
  lastName: "Lovelace",
  displayName: "Ada L.",
  phone: null,
  bio: "Engines",
} as ProfileSchema;

const hasChanges = () => {
  const { initial, draft } = useProfileUpdateStore.getState();
  return JSON.stringify(initial) !== JSON.stringify(draft);
};

describe("profile update store", () => {
  beforeEach(() => {
    useProfileUpdateStore.getState().reset();
    useProfileUpdateStore.getState().hydrate(profile);
  });

  it("starts with no changes after loading the profile", () => {
    expect(hasChanges()).toBe(false);
    expect(useProfileUpdateStore.getState().getChanges()).toEqual({});
  });

  it("reports only the edited fields", () => {
    useProfileUpdateStore.getState().setField("bio", "Analytical engines");

    expect(hasChanges()).toBe(true);
    expect(useProfileUpdateStore.getState().getChanges()).toEqual({
      bio: "Analytical engines",
    });
  });

  it("has no changes once an edit is reverted", () => {
    const { setField, getChanges } = useProfileUpdateStore.getState();
    setField("firstName", "Augusta");
    setField("firstName", "Ada");

    expect(getChanges()).toEqual({});
  });

  it("sends a cleared field as null", () => {
    useProfileUpdateStore.getState().setField("displayName", "");

    expect(useProfileUpdateStore.getState().getChanges()).toEqual({
      displayName: null,
    });
  });

  it("keeps unsaved edits when the profile refetches", () => {
    useProfileUpdateStore.getState().setField("lastName", "Byron");
    useProfileUpdateStore.getState().hydrate(profile);

    expect(useProfileUpdateStore.getState().draft.lastName).toBe("Byron");
  });
});
