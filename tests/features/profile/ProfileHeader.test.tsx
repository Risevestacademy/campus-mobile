import { DefaultHeader } from "@features/profile/components";
import { render, screen } from "@testing-library/react-native";
import React from "react";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

const mockMe = jest.fn();
const mockProfile = jest.fn();
const mockAvailability = jest.fn();

jest.mock("@shared/hooks/useMe", () => ({ useMe: () => mockMe() }));
jest.mock("../../../src/feature/profile/hooks", () => ({
  useProfile: () => mockProfile(),
}));
jest.mock("@core/realtime", () => ({
  useAvailability: () => mockAvailability(),
}));

const me = {
  user: { displayName: "Kemi O.", avatarUrl: null },
  membership: { cohortId: "c1" },
};
const membership = {
  cohort: { id: "c1", name: "Cohort 3" },
  role: "student",
  track: { name: "Design" },
};

describe("DefaultHeader", () => {
  beforeEach(() => {
    mockAvailability.mockReturnValue({
      status: "available",
      setStatus: jest.fn(),
    });
  });

  it("shows skeletons, and no sample text, while loading", async () => {
    mockMe.mockReturnValue({ data: undefined, isLoading: true });
    mockProfile.mockReturnValue({ data: undefined, isLoading: true });
    mockAvailability.mockReturnValue({
      status: undefined,
      setStatus: jest.fn(),
    });

    await render(<DefaultHeader />);

    // Avatar, name, membership line and status toggle.
    expect(screen.getAllByLabelText("Loading")).toHaveLength(4);
    expect(screen.queryByText("Ada Lovelace")).toBeNull();
    expect(screen.queryByText("Student · Track · Cohort")).toBeNull();
  });

  it("shows the member once loaded", async () => {
    mockMe.mockReturnValue({ data: me, isLoading: false });
    mockProfile.mockReturnValue({
      data: { memberships: [membership] },
      isLoading: false,
    });

    await render(<DefaultHeader />);

    expect(screen.queryByLabelText("Loading")).toBeNull();
    expect(screen.getByText("Kemi O.")).toBeTruthy();
    expect(screen.getByText("Student · Design · Cohort 3")).toBeTruthy();
  });

  it("never shows the sample text for a member without a membership", async () => {
    mockMe.mockReturnValue({
      data: { ...me, membership: null },
      isLoading: false,
    });
    mockProfile.mockReturnValue({
      data: { memberships: [] },
      isLoading: false,
    });

    await render(<DefaultHeader />);

    expect(screen.getByText("Kemi O.")).toBeTruthy();
    expect(
      screen.queryByText("Student · Track · Cohort", {
        includeHiddenElements: true,
      }),
    ).toBeNull();
  });
});
