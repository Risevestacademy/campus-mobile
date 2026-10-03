import { InviteDetails, useInviteStore } from "@store/invite";
import { act } from "@testing-library/react-native";

describe("useInviteStore", () => {
  beforeEach(async () => {
    await act(() => {
      useInviteStore.getState().reset();
    });
  });

  it("initializes with null state", () => {
    const state = useInviteStore.getState();
    expect(state.inviteId).toBeNull();
    expect(state.inviteDetails).toBeNull();
  });

  it("updates inviteId and inviteDetails on setInvite", async () => {
    const details = {
      email: "user@campus.com",
      cohortRole: "Student",
    } as unknown as InviteDetails;

    await act(() => {
      useInviteStore.getState().setInvite({
        inviteId: "invite-123",
        inviteDetails: details,
      });
    });

    const state = useInviteStore.getState();
    expect(state.inviteId).toBe("invite-123");
    expect(state.inviteDetails).toEqual(details);
  });

  it("resets state back to initial values", async () => {
    await act(() => {
      useInviteStore.getState().setInvite({
        inviteId: "invite-123",
        inviteDetails: { email: "user@campus.com" } as unknown as InviteDetails,
      });
    });

    await act(() => {
      useInviteStore.getState().reset();
    });

    const state = useInviteStore.getState();
    expect(state.inviteId).toBeNull();
    expect(state.inviteDetails).toBeNull();
  });
});
