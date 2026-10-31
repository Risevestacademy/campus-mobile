import { FloatingCall } from "@shared/components";
import { render, screen } from "@testing-library/react-native";
import React from "react";
import { StyleSheet } from "react-native";

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: jest.fn(), canGoBack: () => false }),
}));

describe("FloatingCall", () => {
  it("shows the call resting at the given distance from the bottom", async () => {
    await render(
      <FloatingCall
        call={{
          participants: [{ name: "You" }, { name: "Ada" }],
          space: "Library",
        }}
        bottomOffset={90}
      />,
    );

    expect(screen.getByText("You, Ada")).toBeTruthy();
    expect(
      StyleSheet.flatten(screen.getByTestId("floating-call").props.style),
    ).toEqual(expect.objectContaining({ bottom: 90 }));
  });

  it("shows nothing without a call", async () => {
    await render(<FloatingCall call={null} bottomOffset={90} />);

    expect(screen.queryByTestId("floating-call")).toBeNull();
  });
});
