import { SpaceCallProvider } from "@features/room";
import { render, screen } from "@testing-library/react-native";
import React from "react";

import Spaces from "../../src/app/(app)/(tabs)/(campus)/spaces";
import SpaceIndex from "../../src/app/(app)/space/[id]/index";

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: jest.fn(), canGoBack: () => true }),
  useLocalSearchParams: () => ({ id: "main-hallway" }),
}));

jest.mock("@shared/hooks/useWs", () => ({
  useWs: () => ({ status: "idle", subscribe: () => () => {} }),
}));

describe("campus routes", () => {
  it("renders the spaces route", async () => {
    await render(<Spaces />);

    expect(screen.getByText("All spaces")).toBeTruthy();
    expect(screen.getByLabelText("Go back")).toBeTruthy();
  });

  it("renders the space detail route", async () => {
    await render(
      <SpaceCallProvider>
        <SpaceIndex />
      </SpaceCallProvider>,
    );

    expect(screen.queryByLabelText("Go back")).toBeNull();
    expect(screen.getByText("Waiting to join…")).toBeTruthy();
  });
});
