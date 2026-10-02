import InvalidInvitationScreen from "@features/auth/screens/InvalidInvitationScreen";
import { render, screen } from "@testing-library/react-native";
import React from "react";

describe("InvalidInvitationScreen", () => {
  it("renders link invalid error message and instructions", async () => {
    await render(<InvalidInvitationScreen />);

    expect(screen.getByText("This link isn’t valid anymore")).toBeTruthy();
    expect(
      screen.getByText(
        "This invitation link has expired or has already been used to set up an account. Links can only be used once.",
      ),
    ).toBeTruthy();
    expect(
      screen.getByText("Contact whoever gave you this link for a new one."),
    ).toBeTruthy();
  });
});
