import SetupProfileScreen from "@features/auth/screens/SetupProfileScreen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { Text as MockText } from "react-native";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  Redirect: ({ href }: { href: string }) => (
    <MockText>redirect:{href}</MockText>
  ),
}));

const mockUseInviteValidate = jest.fn();

jest.mock("@features/auth/hooks", () => ({
  useInviteValidate: () => mockUseInviteValidate(),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
};

describe("SetupProfileScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders user campus identity details from validated invite", async () => {
    mockUseInviteValidate.mockReturnValue({
      data: {
        user: { displayName: "Alex Johnson" },
        cohort: { name: "Web Dev Cohort", startDate: "2026-09-01T00:00:00Z" },
      },
      error: null,
    });

    await renderWithProviders(<SetupProfileScreen />);

    expect(screen.getByText("YOUR CAMPUS IDENTITY")).toBeTruthy();
    expect(screen.getByText("Set up your profile")).toBeTruthy();
    expect(screen.getByText("Alex Johnson")).toBeTruthy();
  });

  it("redirects to InvalidInvitation on query error", async () => {
    mockUseInviteValidate.mockReturnValue({
      data: null,
      error: new Error("Invalid invite"),
    });

    await renderWithProviders(<SetupProfileScreen />);

    expect(screen.getByText("redirect:/(auth)/InvalidInvitation")).toBeTruthy();
  });

  it("navigates to DeviceCheck screen when Save and Continue is pressed", async () => {
    mockUseInviteValidate.mockReturnValue({
      data: {
        user: { displayName: "Alex Johnson" },
        cohort: { name: "Web Dev Cohort", startDate: "2026-09-01T00:00:00Z" },
      },
      error: null,
    });

    await renderWithProviders(<SetupProfileScreen />);

    await fireEvent.press(screen.getByText("Save and Continue"));

    expect(mockPush).toHaveBeenCalledWith("/(auth)/DeviceCheck");
  });
});
