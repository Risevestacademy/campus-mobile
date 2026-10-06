import { ApiError } from "@core/api/error";
import SignInScreen from "@features/auth/screens/SignInScreen";
import { useSessionStore } from "@store/session";
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

const mockSignInWithGoogle = jest.fn();

const mockSignInHookResult = {
  signInWithGoogle: mockSignInWithGoogle,
  isLoading: false,
};

jest.mock("@features/auth/hooks", () => ({
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

describe("SignInScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSessionStore.setState({ status: "unauthenticated" });
  });

  it("renders Google sign in button", async () => {
    await renderWithProviders(<SignInScreen />);

    expect(screen.getByText("Continue with Google")).toBeTruthy();
  });

  it("executes Google sign in flow and navigates to CreatePassword when user has inviteId", async () => {
    (GoogleOneTapSignIn.checkPlayServices as jest.Mock).mockResolvedValueOnce(
      true,
    );
    (GoogleOneTapSignIn.signIn as jest.Mock).mockResolvedValueOnce({
      status: "success",
      data: { idToken: "test-google-id-token" },
    });
    mockSignInWithGoogle.mockResolvedValueOnce({
      accessToken: "abc",
      inviteId: "invite-999",
    });

    await renderWithProviders(<SignInScreen />);

    await fireEvent.press(screen.getByText("Continue with Google"));

    await waitFor(() => {
      expect(GoogleOneTapSignIn.checkPlayServices).toHaveBeenCalled();
      expect(GoogleOneTapSignIn.signIn).toHaveBeenCalled();
      expect(mockSignInWithGoogle).toHaveBeenCalledWith("test-google-id-token");
      expect(mockPush).toHaveBeenCalledWith("/(auth)/CreatePassword");
    });
  });

  it("executes Google sign in flow and navigates to campus main app when user has no inviteId", async () => {
    (GoogleOneTapSignIn.checkPlayServices as jest.Mock).mockResolvedValueOnce(
      true,
    );
    (GoogleOneTapSignIn.signIn as jest.Mock).mockResolvedValueOnce({
      status: "success",
      data: { idToken: "test-google-id-token" },
    });
    mockSignInWithGoogle.mockResolvedValueOnce({
      accessToken: "abc",
    });

    await renderWithProviders(<SignInScreen />);

    await fireEvent.press(screen.getByText("Continue with Google"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)/(campus)");
    });
  });

  it("redirects to (tabs)/(campus) when ApiError is INVITE_ALREADY_ACCEPTED", async () => {
    (GoogleOneTapSignIn.checkPlayServices as jest.Mock).mockResolvedValueOnce(
      true,
    );
    (GoogleOneTapSignIn.signIn as jest.Mock).mockResolvedValueOnce({
      status: "success",
      data: { idToken: "test-google-id-token" },
    });

    const inviteAcceptedError = new ApiError(400, {
      code: "INVITE_ALREADY_ACCEPTED",
      message: "Invite accepted",
    });
    mockSignInWithGoogle.mockRejectedValueOnce(inviteAcceptedError);

    await renderWithProviders(<SignInScreen />);

    await fireEvent.press(screen.getByText("Continue with Google"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)/(campus)");
    });
  });

  it("redirects to InvalidInvitation when ApiError is INVITE_ALREADY_DECLINED", async () => {
    (GoogleOneTapSignIn.checkPlayServices as jest.Mock).mockResolvedValueOnce(
      true,
    );
    (GoogleOneTapSignIn.signIn as jest.Mock).mockResolvedValueOnce({
      status: "success",
      data: { idToken: "test-google-id-token" },
    });

    const inviteDeclinedError = new ApiError(400, {
      code: "INVITE_ALREADY_DECLINED",
      message: "Invite declined",
    });
    mockSignInWithGoogle.mockRejectedValueOnce(inviteDeclinedError);

    await renderWithProviders(<SignInScreen />);

    await fireEvent.press(screen.getByText("Continue with Google"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/InvalidInvitation");
    });
  });
});
