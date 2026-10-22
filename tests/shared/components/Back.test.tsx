import { Back } from "@shared/components";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

const mockBack = jest.fn();
const mockCanGoBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack, canGoBack: mockCanGoBack }),
}));

describe("Back", () => {
  it("is exposed to assistive tech as a labelled button", async () => {
    await render(<Back />);

    expect(screen.getByRole("button", { name: "Go back" })).toBeTruthy();
  });

  it("navigates back when there is history", async () => {
    mockCanGoBack.mockReturnValue(true);
    await render(<Back />);

    await fireEvent.press(screen.getByLabelText("Go back"));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("does nothing when there is no history", async () => {
    mockCanGoBack.mockReturnValue(false);
    await render(<Back />);

    await fireEvent.press(screen.getByLabelText("Go back"));

    expect(mockBack).not.toHaveBeenCalled();
  });
});
