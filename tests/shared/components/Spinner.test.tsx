import { Spinner } from "@shared/components/atoms";
import { render, screen } from "@testing-library/react-native";
import React from "react";
import { useReducedMotion } from "react-native-reanimated";

describe("Spinner", () => {
  afterEach(() => {
    jest.mocked(useReducedMotion).mockReturnValue(false);
  });

  it("is announced as loading and busy", async () => {
    await render(<Spinner />);

    const spinner = screen.getByRole("progressbar");
    expect(spinner.props.accessibilityLabel).toBe("Loading");
    expect(spinner.props.accessibilityState).toEqual({ busy: true });
  });

  it("draws the ring by default, and the arc when asked", async () => {
    const { rerender } = await render(<Spinner testID="spinner" />);
    expect(screen.getByTestId("spinner-ring")).toBeTruthy();

    await rerender(<Spinner testID="spinner" variant="arc" />);
    expect(screen.queryByTestId("spinner-ring")).toBeNull();
  });

  it("takes its own label", async () => {
    await render(<Spinner accessibilityLabel="Saving profile" />);

    expect(screen.getByLabelText("Saving profile")).toBeTruthy();
  });

  it("spins slower with Reduce Motion, but keeps spinning", async () => {
    jest.mocked(useReducedMotion).mockReturnValue(true);

    await render(<Spinner testID="spinner" />);

    const arc = screen.getByTestId("spinner").children[0] as unknown as {
      props: { style: Record<string, unknown> };
    };
    expect(arc.props.style).toMatchObject({
      animationDuration: "1600ms",
      animationIterationCount: "infinite",
    });
  });
});
