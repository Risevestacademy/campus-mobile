import { SpacesScreen } from "@features/campus";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: jest.fn(), canGoBack: () => false }),
}));

describe("SpacesScreen", () => {
  it("shows every space under the All filter", async () => {
    await render(<SpacesScreen />);

    expect(screen.getByText("Calculus II")).toBeTruthy();
    expect(screen.getByText("Organic Chemistry Lab")).toBeTruthy();
    expect(screen.getByText("Main Lounge")).toBeTruthy();
  });

  it("shows only available spaces under the Available filter", async () => {
    await render(<SpacesScreen />);

    await fireEvent.press(screen.getByText("Available"));

    expect(screen.getByText("Organic Chemistry Lab")).toBeTruthy();
    expect(screen.getByText("Study Pod 4")).toBeTruthy();
    expect(screen.queryByText("Calculus II")).toBeNull();
    expect(screen.queryByText("Main Lounge")).toBeNull();
  });

  it("shows only spaces with people under the Has people filter", async () => {
    await render(<SpacesScreen />);

    await fireEvent.press(screen.getByText("Has people"));

    expect(screen.getByText("Calculus II")).toBeTruthy();
    expect(screen.queryByText("Organic Chemistry Lab")).toBeNull();
    expect(screen.queryByText("Study Pod 4")).toBeNull();
  });
});
