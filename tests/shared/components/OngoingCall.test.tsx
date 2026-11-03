import { formatCallNames, OngoingCall } from "@shared/components";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: jest.fn(), canGoBack: () => false }),
}));

const people = ["Ada", "Cy", "Bo", "Di", "Ed"].map((name) => ({ name }));

describe("formatCallNames", () => {
  it("names up to two people and counts the rest", () => {
    expect(formatCallNames([])).toBe("");
    expect(formatCallNames(["Ada"])).toBe("Ada");
    expect(formatCallNames(["Ada", "Cy"])).toBe("Ada, Cy");
    expect(formatCallNames(["Ada", "Cy", "Bo", "Di", "Ed"])).toBe("Ada, Cy +3");
  });
});

describe("OngoingCall", () => {
  it("shows who's on the call and where", async () => {
    await render(
      <OngoingCall
        participants={people}
        space="Library"
        callTitle="Standup"
        duration="12:04"
      />,
    );

    expect(screen.getByText("Ada, Cy +3")).toBeTruthy();
    expect(screen.getByText("Standup · Library · 12:04")).toBeTruthy();
  });

  it("toggles mute and leaves", async () => {
    const onToggleMute = jest.fn();
    const onLeave = jest.fn();
    const { rerender } = await render(
      <OngoingCall
        participants={people}
        space="Library"
        onToggleMute={onToggleMute}
        onLeave={onLeave}
      />,
    );

    await fireEvent.press(screen.getByLabelText("Mute"));
    await fireEvent.press(screen.getByLabelText("Leave call"));
    expect(onToggleMute).toHaveBeenCalled();
    expect(onLeave).toHaveBeenCalled();

    await rerender(<OngoingCall participants={people} space="Library" muted />);
    expect(screen.getByLabelText("Unmute")).toBeTruthy();
  });
});
