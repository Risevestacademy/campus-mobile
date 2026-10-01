import { InvitationScreen } from "@features/auth";
import { fireEvent, render, screen } from "@testing-library/react-native";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("InvitationScreen", () => {
  it("shows the campus invitation heading", async () => {
    await render(<InvitationScreen />);

    expect(screen.getByText("CAMPUS INVITATION")).toBeTruthy();
  });

  it("shows the invite headline", async () => {
    await render(<InvitationScreen />);

    expect(
      screen.getByText("You're invited to join Product Design Cohort 2026"),
    ).toBeTruthy();
  });

  it("navigates to CreatePassword on Continue", async () => {
    await render(<InvitationScreen />);

    await fireEvent.press(screen.getByText("Continue"));

    expect(mockPush).toHaveBeenCalledWith("/(auth)/CreatePassword");
  });
});
