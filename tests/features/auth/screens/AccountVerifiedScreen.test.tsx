import AccountVerifiedScreen from "@features/auth/screens/AccountVerifiedScreen";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("AccountVerifiedScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders welcome message and navigation buttons", async () => {
    await render(<AccountVerifiedScreen />);

    expect(screen.getByText("Welcome to Campus!")).toBeTruthy();
    expect(screen.getByText("Connected successfully")).toBeTruthy();
    expect(screen.getByText("Go to Campus")).toBeTruthy();
    expect(screen.getByText("View your profile")).toBeTruthy();
  });

  it("navigates to Campus tabs when Go to Campus is pressed", async () => {
    await render(<AccountVerifiedScreen />);

    await fireEvent.press(screen.getByText("Go to Campus"));

    expect(mockPush).toHaveBeenCalledWith("/(tabs)/(campus)");
  });

  it("navigates to SetupProfile when View your profile is pressed", async () => {
    await render(<AccountVerifiedScreen />);

    await fireEvent.press(screen.getByText("View your profile"));

    expect(mockPush).toHaveBeenCalledWith("/(auth)/SetupProfile");
  });
});
