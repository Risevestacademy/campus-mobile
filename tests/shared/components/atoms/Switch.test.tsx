import { Switch } from "@shared/components/atoms";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

describe("Switch", () => {
  it("turns on when off", async () => {
    const onChange = jest.fn();
    await render(
      <Switch value={false} onChange={onChange} accessibilityLabel="Desk" />,
    );

    const toggle = screen.getByRole("switch", { name: "Desk" });
    expect(toggle).not.toBeChecked();
    await fireEvent.press(toggle);

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("turns off when on", async () => {
    const onChange = jest.fn();
    await render(<Switch value onChange={onChange} />);

    expect(screen.getByRole("switch")).toBeChecked();
    await fireEvent.press(screen.getByRole("switch"));

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("does nothing while disabled", async () => {
    const onChange = jest.fn();
    await render(<Switch value={false} onChange={onChange} disabled />);

    expect(screen.getByRole("switch")).toBeDisabled();
    await fireEvent.press(screen.getByRole("switch"));

    expect(onChange).not.toHaveBeenCalled();
  });
});
