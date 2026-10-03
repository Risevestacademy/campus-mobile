import InvitationScreen from "@features/auth/screens/InvitationScreen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { GoogleOneTapSignIn } from "react-native-nitro-google-signin";

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockPreviewInvite = jest.fn();
const mockSignInWithGoogle = jest.fn();

const mockInvitePreviewResult = {
  previewInvite: mockPreviewInvite,
  isLoading: false,
};

const mockSignInResult = {
  signInWithGoogle: mockSignInWithGoogle,
  isLoading: false,
};

const mockRouter = { push: mockPush, replace: mockReplace };

jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: jest.fn(),
}));

jest.mock("@features/auth/hooks", () => ({
  useInvitePreview: () => mockInvitePreviewResult,
  useSignInWithGoogle: () => mockSignInResult,
}));

const details = {
  cohortRole: "Student",
  invitedBy: { firstName: "Sarah" },
  cohort: { name: "Cohort Alpha", startDate: "2026-09-01T00:00:00Z" },
  track: { name: "Product Design" },
};

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
};

describe("InvitationScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPreviewInvite.mockReset();
    mockSignInWithGoogle.mockReset();
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      token: "valid-token-123",
    });
  });

  it("previews the invite with the route token and shows details", async () => {
    mockPreviewInvite.mockResolvedValueOnce(details);

    await renderWithProviders(<InvitationScreen />);

    await waitFor(() =>
      expect(mockPreviewInvite).toHaveBeenCalledWith("valid-token-123"),
    );
    expect(
      await screen.findByText("You're invited to join Product Design 2026"),
    ).toBeTruthy();
    expect(screen.getByText("Invited by Sarah")).toBeTruthy();
    expect(screen.getByText("Role · Student")).toBeTruthy();
  });

  it("redirects to InvalidInvitation when the preview fails", async () => {
    mockPreviewInvite.mockRejectedValueOnce(new Error("Invalid token"));

    await renderWithProviders(<InvitationScreen />);

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith("/InvalidInvitation"),
    );
  });

  it("goes to CreatePassword when Continue with Google is pressed and sign in succeeds", async () => {
    mockPreviewInvite.mockResolvedValueOnce(details);
    (GoogleOneTapSignIn.checkPlayServices as jest.Mock).mockResolvedValueOnce(
      true,
    );
    (GoogleOneTapSignIn.createAccount as jest.Mock).mockResolvedValueOnce({
      status: "success",
      data: { idToken: "test-google-id-token" },
    });
    mockSignInWithGoogle.mockResolvedValueOnce({ accessToken: "abc" });

    await renderWithProviders(<InvitationScreen />);

    const continueButton = await screen.findByText("Continue with Google");
    await fireEvent.press(continueButton);

    await waitFor(() => {
      expect(GoogleOneTapSignIn.checkPlayServices).toHaveBeenCalled();
      expect(mockSignInWithGoogle).toHaveBeenCalledWith("test-google-id-token");
      expect(mockReplace).toHaveBeenCalledWith("/(auth)/CreatePassword");
    });
  });
});
