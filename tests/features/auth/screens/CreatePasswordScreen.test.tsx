import CreatePasswordScreen from "@features/auth/screens/CreatePasswordScreen";
import { InviteDetails, useInviteStore } from "@store/invite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";
import { GoogleOneTapSignIn } from "react-native-nitro-google-signin";

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockRouter = { push: mockPush, replace: mockReplace };

jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));

const mockDecideOnInvite = jest.fn();
const mockSignInWithGoogle = jest.fn();

const mockInviteDecisionHookResult = {
  decideOnInvite: mockDecideOnInvite,
  isLoading: false,
};

const mockSignInHookResult = {
  signInWithGoogle: mockSignInWithGoogle,
  isLoading: false,
};

jest.mock("@features/auth/hooks", () => ({
  useInviteDecision: () => mockInviteDecisionHookResult,
  useSignInWithGoogle: () => mockSignInHookResult,
}));

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
};

describe("CreatePasswordScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useInviteStore.getState().setInvite({
      inviteId: "invite-123",
      inviteDetails: {
        email: "student@campus.com",
        cohortRole: "Student",
        track: { name: "Software Development" },
        cohort: { name: "Cohort 1", startDate: "2026-09-01T00:00:00Z" },
      } as unknown as InviteDetails,
    });
  });

  it("renders invitation details card with store state", async () => {
    await renderWithProviders(<CreatePasswordScreen isDeepLinked={false} />);

    expect(screen.getByText("Are your details correct?")).toBeTruthy();
    expect(screen.getByText("student@campus.com")).toBeTruthy();
    expect(screen.getByText("Student")).toBeTruthy();
  });

  it("submits decision to accept invite when Continue is pressed in standard flow", async () => {
    mockDecideOnInvite.mockResolvedValueOnce({ success: true });

    await renderWithProviders(<CreatePasswordScreen isDeepLinked={false} />);

    await fireEvent.press(screen.getByText("Continue"));

    await waitFor(() => {
      expect(mockDecideOnInvite).toHaveBeenCalledWith({
        decision: "accept",
        token: "invite-123",
      });
    });
  });

  it("triggers Google sign in and accepts invite when deep linked", async () => {
    (GoogleOneTapSignIn.checkPlayServices as jest.Mock).mockResolvedValueOnce(
      true,
    );
    (GoogleOneTapSignIn.signIn as jest.Mock).mockResolvedValueOnce({
      status: "success",
      data: { idToken: "google-id-token" },
    });
    mockSignInWithGoogle.mockResolvedValueOnce({ inviteId: "invite-456" });
    mockDecideOnInvite.mockResolvedValueOnce({ success: true });

    await renderWithProviders(<CreatePasswordScreen isDeepLinked={true} />);

    await fireEvent.press(screen.getByText("Continue with Google"));

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalledWith("google-id-token");
      expect(mockDecideOnInvite).toHaveBeenCalledWith({
        decision: "accept",
        token: "invite-456",
      });
      expect(mockReplace).toHaveBeenCalledWith("/(auth)/AccountVerified");
    });
  });

  it("displays expired link modal when inviteId is missing on accept press", async () => {
    useInviteStore.getState().reset();

    await renderWithProviders(<CreatePasswordScreen isDeepLinked={false} />);

    await fireEvent.press(screen.getByText("Continue"));

    await waitFor(() => {
      expect(screen.getByText("Invite link expired")).toBeTruthy();
    });
  });
});
