import { Skeleton } from "@shared/components";
import { render, screen } from "@testing-library/react-native";
import React from "react";
import { StyleSheet, Text } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: jest.fn(), canGoBack: () => false }),
}));

const flat = (testID: string) =>
  StyleSheet.flatten(
    screen.getByTestId(testID, { includeHiddenElements: true }).props.style,
  );

describe("Skeleton", () => {
  it("renders the child as it is once loaded", async () => {
    await render(
      <Skeleton>
        <Text>Hi, Ada</Text>
      </Skeleton>,
    );

    expect(screen.getByText("Hi, Ada")).toBeTruthy();
    expect(screen.queryByTestId("skeleton")).toBeNull();
  });

  it("shows a placeholder in the child's place while loading", async () => {
    await render(
      <Skeleton isLoading>
        <Text>Hi, Ada</Text>
      </Skeleton>,
    );

    const skeleton = screen.getByLabelText("Loading");
    expect(skeleton.props.accessibilityState).toEqual({ busy: true });
    expect(screen.getByTestId("skeleton-placeholder")).toBeTruthy();
    // Still laid out for its size, but not read out.
    expect(screen.queryByText("Hi, Ada")).toBeNull();
    expect(
      screen.getByText("Hi, Ada", { includeHiddenElements: true }),
    ).toBeTruthy();
  });

  it("takes the given size and shape", async () => {
    await render(
      <Skeleton isLoading width={50} height={50} radius="round">
        <Text>A</Text>
      </Skeleton>,
    );

    expect(flat("skeleton")).toEqual(
      expect.objectContaining({ width: 50, height: 50, borderRadius: 9999 }),
    );
  });

  it("pulses, unless Reduce Motion is on", async () => {
    const { rerender } = await render(
      <Skeleton isLoading>
        <Text>A</Text>
      </Skeleton>,
    );
    expect(flat("skeleton-placeholder")).toEqual(
      expect.objectContaining({ animationIterationCount: "infinite" }),
    );

    jest.mocked(useReducedMotion).mockReturnValue(true);
    await rerender(
      <Skeleton isLoading>
        <Text>A</Text>
      </Skeleton>,
    );
    expect(flat("skeleton-placeholder")).not.toHaveProperty("animationName");
    jest.mocked(useReducedMotion).mockReturnValue(false);
  });
});
