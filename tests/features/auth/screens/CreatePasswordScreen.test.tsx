import { ApiError } from "@core/api/error";
import CreatePasswordScreen from "@features/auth/screens/CreatePasswordScreen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockRouter = { push: mockPush, replace: mockReplace };

jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));

const mockDecideOnInvite = jest.fn();
const mockValidateData = {
  id: "invite-123",
  user: { email: "student@campus.com", displayName: "Student Name" },
  cohortRole: "Student",
  cohort: { name: "Cohort 1", startDate: "2026-09-01T00:00:00Z" },
  track: { name: "Software Development" },
};

let mockValidateResult = {
  data: mockValidateData,
  isLoading: false,
};

const mockInviteDecisionHookResult = {
  decideOnInvite: mockDecideOnInvite,
  isLoading: false,
};

jest.mock("@features/auth/hooks", () => ({
  useInviteDecision: () => mockInviteDecisionHookResult,
  useInviteValidate: () => mockValidateResult,
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
    mockValidateResult = {
      data: mockValidateData,
      isLoading: false,
    };
  });

  it("renders invitation details card with validate data", async () => {
    await renderWithProviders(<CreatePasswordScreen />);

    expect(screen.getByText("Are your details correct?")).toBeTruthy();
    expect(screen.getByText("student@campus.com")).toBeTruthy();
    expect(screen.getByText("Student")).toBeTruthy();
  });

  it("submits decision to accept invite when Continue is pressed", async () => {
    mockDecideOnInvite.mockResolvedValueOnce({ success: true });

    await renderWithProviders(<CreatePasswordScreen />);

    await fireEvent.press(screen.getByText("Continue"));

    await waitFor(() => {
      expect(mockDecideOnInvite).toHaveBeenCalledWith({
        decision: "accept",
        token: "invite-123",
      });
      expect(mockReplace).toHaveBeenCalledWith("/SetupProfile");
    });
  });

  it("displays expired link modal when invite is declined", async () => {
    const inviteDeclinedError = new ApiError(400, {
      code: "INVITE_ALREADY_DECLINED",
      message: "Declined",
    });
    mockDecideOnInvite.mockRejectedValueOnce(inviteDeclinedError);

    await renderWithProviders(<CreatePasswordScreen />);

    await fireEvent.press(screen.getByText("Continue"));

    await waitFor(() => {
      expect(screen.getByText("Invite link expired")).toBeTruthy();
    });
  });

  it("redirects to InvalidInvitation when invite is already accepted", async () => {
    const inviteAcceptedError = new ApiError(400, {
      code: "INVITE_ALREADY_ACCEPTED",
      message: "Already accepted",
    });
    mockDecideOnInvite.mockRejectedValueOnce(inviteAcceptedError);

    await renderWithProviders(<CreatePasswordScreen />);

    await fireEvent.press(screen.getByText("Continue"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/(auth)/InvalidInvitation");
    });
  });
});
