import {
  appearanceIcon,
  AppearanceSheet,
  appearanceSubtitle,
} from "@features/profile/components";
import { useAppearanceStore } from "@store/appearance";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { Moon, Sun } from "lucide-react-native";
import React from "react";

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: jest.fn(), canGoBack: () => false }),
}));

describe("appearance helpers", () => {
  it("names the resolved scheme when following the system", () => {
    expect(appearanceSubtitle("system", "dark")).toBe("System · Dark");
    expect(appearanceSubtitle("system", "light")).toBe("System · Light");
    expect(appearanceSubtitle("dark", "dark")).toBe("Dark");
  });

  it("picks the icon from the active scheme", () => {
    expect(appearanceIcon("dark")).toBe(Moon);
    expect(appearanceIcon("light")).toBe(Sun);
  });
});

describe("AppearanceSheet", () => {
  const setPreference = jest.fn();

  beforeEach(() => {
    useAppearanceStore.setState({ preference: "system", setPreference });
  });

  it("marks the saved preference as selected", async () => {
    await render(<AppearanceSheet />);

    const selected = screen
      .getAllByRole("radio")
      .map((radio) => radio.props.accessibilityState?.selected);
    expect(selected).toEqual([true, false, false]);
  });

  it("saves the chosen preference", async () => {
    await render(<AppearanceSheet />);

    await fireEvent.press(screen.getByText("Dark"));

    expect(setPreference).toHaveBeenCalledWith("dark");
  });
});
