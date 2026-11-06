import { OtherDeviceBanner } from "@shared/components";
import type { ServerMessage } from "@shared/lib/ws";
import { useWorldStore } from "@store/world";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { Uniwind } from "uniwind";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

const mockReconnect = jest.fn();
const mockWs = { status: "open" };

jest.mock("@shared/hooks/useWs", () => ({
  useWs: () => ({ status: mockWs.status, reconnect: mockReconnect }),
}));

jest.mock("react-native-safe-area-context", () => {
  const actual = jest.requireActual("react-native-safe-area-context");
  const insets = { top: 47, bottom: 34, left: 0, right: 0 };
  return { ...actual, useSafeAreaInsets: jest.fn(() => insets) };
});

const apply = (message: unknown) =>
  useWorldStore.getState().apply(message as ServerMessage);

/** Prints the top inset the screens below see, as useSafeAreaInsets reads it. */
function Screen() {
  const insets = React.useContext(SafeAreaInsetsContext);
  return <Text>{`top ${insets?.top}`}</Text>;
}

function renderBanner() {
  return render(
    <OtherDeviceBanner>
      <Screen />
    </OtherDeviceBanner>,
  );
}

describe("OtherDeviceBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWs.status = "open";
    useWorldStore.getState().reset();
  });

  it("stays out of the way while this device stands for you", async () => {
    apply({ type: "welcome", userId: "me", mode: "avatar" });

    await renderBanner();

    expect(screen.queryByTestId("other-device-banner")).toBeNull();
    expect(screen.getByText("top 47")).toBeTruthy();
  });

  it("shows while watching, and Enter here takes the avatar back", async () => {
    const updateInsets = jest.spyOn(Uniwind, "updateInsets");
    apply({ type: "welcome", userId: "me", mode: "watcher" });

    await renderBanner();

    expect(
      screen.getByText("You’re on campus on another device."),
    ).toBeTruthy();
    // The banner sits over the status bar, so the screen below loses its inset.
    expect(screen.getByText("top 0")).toBeTruthy();
    expect(updateInsets).toHaveBeenLastCalledWith(
      expect.objectContaining({ top: 0 }),
    );

    await fireEvent.press(screen.getByText("Enter here"));
    expect(mockReconnect).toHaveBeenCalled();
  });

  it("shows when another device took over and we couldn't stay", async () => {
    mockWs.status = "replaced";

    await renderBanner();

    expect(screen.getByTestId("other-device-banner")).toBeTruthy();
  });

  it("goes away, and gives the inset back, once this device is in again", async () => {
    const updateInsets = jest.spyOn(Uniwind, "updateInsets");
    apply({ type: "welcome", userId: "me", mode: "watcher" });
    await renderBanner();

    await act(() => apply({ type: "welcome", userId: "me", mode: "avatar" }));

    expect(screen.queryByTestId("other-device-banner")).toBeNull();
    expect(updateInsets).toHaveBeenLastCalledWith(
      expect.objectContaining({ top: 47 }),
    );
  });
});
