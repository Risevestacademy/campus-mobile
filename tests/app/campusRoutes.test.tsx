import { SpaceCallProvider, SpaceRoomHost } from "@features/room";
import { render, screen } from "@testing-library/react-native";
import React from "react";

import Spaces from "../../src/app/(app)/(tabs)/(campus)/spaces";
import SpaceIndex from "../../src/app/(app)/space/[id]/index";

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: jest.fn(), canGoBack: () => true }),
  useLocalSearchParams: () => ({ id: "main-hallway" }),
}));

const mockSend = jest.fn(() => true);

jest.mock("@shared/hooks/useWs", () => ({
  useWs: () => ({
    status: "idle",
    subscribe: () => () => {},
    send: mockSend,
    rejoin: jest.fn(),
  }),
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
        <SpaceRoomHost>
          <SpaceIndex />
        </SpaceRoomHost>
      </SpaceCallProvider>,
    );

    expect(screen.queryByLabelText("Go back")).toBeNull();
    // Not in the space yet: opening it walks you there before any call.
    expect(screen.getByText("Walking to main-hallway…")).toBeTruthy();
    expect(mockSend).toHaveBeenCalledWith({
      type: "goToSpace",
      spaceKey: "main-hallway",
    });
  });
});
