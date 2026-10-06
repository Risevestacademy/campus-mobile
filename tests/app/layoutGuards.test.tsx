import { useSessionStore } from "@store/session";
import { render } from "@testing-library/react-native";
import React from "react";

import RootLayout from "../../src/app/_layout";

jest.mock("../../src/global.css", () => ({}));

const mockProtectedCalls: { name?: string; guard?: boolean }[] = [];

jest.mock("expo-router", () => {
  const mockReact = jest.requireActual("react");
  const MockScreen = ({ name }: { name?: string }) =>
    mockReact.createElement("Screen", { name });
  const MockProtected = ({
    guard,
    children,
  }: {
    guard?: boolean;
    children?: React.ReactNode;
  }) => {
    mockReact.Children.forEach(children, (child: unknown) => {
      if (
        child &&
        typeof child === "object" &&
        "props" in child &&
        child.props &&
        typeof child.props === "object"
      ) {
        const props = child.props as { name?: string };
        mockProtectedCalls.push({
          name: props.name,
          guard,
        });
      }
    });
    return mockReact.createElement("Protected", { guard }, children);
  };

  const MockStack = ({ children }: { children?: React.ReactNode }) =>
    mockReact.createElement("Stack", null, children);
  MockStack.Screen = MockScreen;
  MockStack.Protected = MockProtected;

  return {
    Stack: MockStack,
  };
});

jest.mock("uniwind", () => ({
  ...jest.requireActual("uniwind"),
  useResolveClassNames: () => ({}),
}));

describe("RootLayout Protected Route Guards", () => {
  beforeEach(() => {
    mockProtectedCalls.length = 0;
    useSessionStore.setState({ status: "loading", hasInvite: false });
  });

  it("allows access to (auth) with loading state and blocks (tabs) while hydration is in progress", async () => {
    useSessionStore.setState({ status: "loading", hasInvite: false });
    await render(<RootLayout />);

    const authCall = mockProtectedCalls.find((c) => c.name === "(auth)");
    const appCall = mockProtectedCalls.find((c) => c.name === "(tabs)");

    expect(authCall?.guard).toBe(true);
    expect(appCall?.guard).toBe(false);
  });

  it("allows access to (auth) and disallows (tabs) when unauthenticated", async () => {
    useSessionStore.setState({ status: "unauthenticated", hasInvite: false });
    await render(<RootLayout />);

    const authCall = mockProtectedCalls.find((c) => c.name === "(auth)");
    const appCall = mockProtectedCalls.find((c) => c.name === "(tabs)");

    expect(authCall?.guard).toBe(true);
    expect(appCall?.guard).toBe(false);
  });

  it("allows access to (auth) and disallows (tabs) when authenticated with pending invite", async () => {
    useSessionStore.setState({ status: "authenticated", hasInvite: true });
    await render(<RootLayout />);

    const authCall = mockProtectedCalls.find((c) => c.name === "(auth)");
    const appCall = mockProtectedCalls.find((c) => c.name === "(tabs)");

    expect(authCall?.guard).toBe(true);
    expect(appCall?.guard).toBe(false);
  });

  it("allows access to (tabs) and disallows (auth) when authenticated with accepted invite", async () => {
    useSessionStore.setState({ status: "authenticated", hasInvite: false });
    await render(<RootLayout />);

    const authCall = mockProtectedCalls.find((c) => c.name === "(auth)");
    const appCall = mockProtectedCalls.find((c) => c.name === "(tabs)");

    expect(authCall?.guard).toBe(false);
    expect(appCall?.guard).toBe(true);
  });
});
