import { render, screen } from "@testing-library/react-native";
import React from "react";

import SpaceIndex from "../../src/app/(tabs)/(campus)/space/[id]/index";
import Spaces from "../../src/app/(tabs)/(campus)/spaces";

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: jest.fn(), canGoBack: () => true }),
}));

describe("campus routes", () => {
  it("renders the spaces route", async () => {
    await render(<Spaces />);

    expect(screen.getByText("All spaces")).toBeTruthy();
    expect(screen.getByLabelText("Go back")).toBeTruthy();
  });

  it("renders the space detail route", async () => {
    await render(<SpaceIndex />);

    expect(screen.getByLabelText("Go back")).toBeTruthy();
  });
});
