import { ActivityToggle } from "@shared/components";
import {
  clearAfterOptions,
  clearAfterSeconds,
  MAX_STATUS_SECONDS,
} from "@shared/components/ActivityToggle";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

const UNTIL = "2026-11-06T15:00:00.000Z";
const untilText = new Date(UNTIL).toLocaleTimeString([], {
  hour: "numeric",
  minute: "2-digit",
});

const pickClearAfter = async (label: string) => {
  await fireEvent.press(screen.getByLabelText(/^Clear after:/));
  await fireEvent.press(screen.getByRole("radio", { name: label }));
};

describe("ActivityToggle", () => {
  const onChange = jest.fn();

  beforeEach(() => {
    onChange.mockClear();
  });

  it("shows when a timed status ends", async () => {
    await render(
      <ActivityToggle status="busy" until={UNTIL} onChange={onChange} />,
    );

    expect(screen.getByText(`Busy · until ${untilText}`)).toBeTruthy();
  });

  it("sets a status that lasts by default", async () => {
    await render(<ActivityToggle status="available" onChange={onChange} />);

    expect(screen.getByLabelText("Clear after: Don't clear")).toBeTruthy();
    await fireEvent.press(screen.getByText("Away"));

    expect(onChange).toHaveBeenCalledWith("away", undefined);
  });

  it("sets a status for as long as the timer says", async () => {
    await render(<ActivityToggle status="available" onChange={onChange} />);

    await pickClearAfter("1 hour");
    expect(screen.getByLabelText("Clear after: 1 hour")).toBeTruthy();
    await fireEvent.press(screen.getByText("Busy"));

    expect(onChange).toHaveBeenCalledWith("busy", 3600);
  });

  it("re-times the status you already have", async () => {
    await render(<ActivityToggle status="available" onChange={onChange} />);

    await pickClearAfter("30 minutes");
    await fireEvent.press(screen.getAllByText("Available").at(-1)!);

    expect(onChange).toHaveBeenCalledWith("available", 1800);
  });

  it("starts from the timer the status already has", async () => {
    await render(
      <ActivityToggle status="busy" until={UNTIL} onChange={onChange} />,
    );

    expect(
      screen.getByLabelText(`Clear after: Until ${untilText}`),
    ).toBeTruthy();
    // Same status, same timer: nothing to change.
    await fireEvent.press(screen.getAllByText("Busy").at(-1)!);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps the timer when only the status changes", async () => {
    await render(
      <ActivityToggle status="busy" until={UNTIL} onChange={onChange} />,
    );

    await fireEvent.press(screen.getByText("Away"));

    expect(onChange).toHaveBeenCalledWith("away", expect.any(Number));
  });

  it("removes the timer with Don't clear", async () => {
    await render(
      <ActivityToggle status="busy" until={UNTIL} onChange={onChange} />,
    );

    await pickClearAfter("Don't clear");
    await fireEvent.press(screen.getAllByText("Busy").at(-1)!);

    expect(onChange).toHaveBeenCalledWith("busy", undefined);
  });

  it("sends nothing for the same status without a timer", async () => {
    await render(<ActivityToggle status="away" onChange={onChange} />);

    await fireEvent.press(screen.getAllByText("Away").at(-1)!);

    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("clearAfterSeconds", () => {
  it("keeps it for good when it isn't timed", () => {
    expect(clearAfterSeconds("never")).toBeUndefined();
  });

  it("lasts until midnight for Today", () => {
    const now = new Date(2026, 10, 6, 22, 30, 0);
    expect(clearAfterSeconds("today", now)).toBe(90 * 60);
  });

  it("never asks world for more than 12 hours", () => {
    const morning = new Date(2026, 10, 6, 9, 0, 0);
    expect(clearAfterSeconds("today", morning)).toBe(MAX_STATUS_SECONDS);
  });
});

describe("clearAfterOptions", () => {
  const keys = (now: Date, until?: string) =>
    clearAfterOptions(until, now).map((option) => option.key);

  it("offers Today only once midnight is within 12 hours", () => {
    expect(keys(new Date(2026, 10, 6, 9, 0))).not.toContain("today");
    expect(keys(new Date(2026, 10, 6, 13, 0))).toContain("today");
  });

  it("offers the current timer first when there is one", () => {
    expect(keys(new Date(2026, 10, 6, 13, 0), UNTIL)[0]).toBe("current");
    expect(keys(new Date(2026, 10, 6, 13, 0))).not.toContain("current");
  });
});
