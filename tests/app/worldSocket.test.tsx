import { useSessionStore } from "@store/session";
import { render } from "@testing-library/react-native";
import React from "react";

import RootLayout from "../../src/app/_layout";

jest.mock("../../src/global.css", () => ({}));

jest.mock("expo-router", () => {
  const MockNull = () => null;
  const MockStack = Object.assign(() => null, {
    Screen: MockNull,
    Protected: MockNull,
  });
  return { useRouter: () => ({ push: jest.fn() }), Stack: MockStack };
});

jest.mock("uniwind", () => ({
  ...jest.requireActual("uniwind"),
  useResolveClassNames: () => ({}),
}));

const mockProviderProps = jest.fn();

jest.mock("@shared/components/providers/ws", () => ({
  WebSocketProvider: (props: {
    url: string;
    cohortId: string | null;
    children: React.ReactNode;
  }) => {
    mockProviderProps({ url: props.url, cohortId: props.cohortId });
    return props.children;
  },
}));

const mockUseMe = jest.fn();

jest.mock("@shared/hooks/useMe", () => ({
  useMe: (options: { enabled?: boolean }) => mockUseMe(options),
}));

describe("RootLayout world socket", () => {
  beforeEach(() => {
    mockProviderProps.mockClear();
    mockUseMe.mockReset();
    // Real hydrate finds no stored tokens and signs the session out.
    useSessionStore.setState({ hydrate: async () => {} });
  });

  it("connects to the configured world URL with the member's cohort", async () => {
    useSessionStore.setState({ status: "authenticated", hasInvite: false });
    mockUseMe.mockReturnValue({
      data: { membership: { cohortId: "c-latest" } },
    });

    await render(<RootLayout />);

    expect(mockUseMe).toHaveBeenLastCalledWith({ enabled: true });
    expect(mockProviderProps).toHaveBeenLastCalledWith({
      url: "wss://localhost:3001/socket",
      cohortId: "c-latest",
    });
  });

  it("passes no cohort when the account has no membership", async () => {
    useSessionStore.setState({ status: "authenticated", hasInvite: true });
    mockUseMe.mockReturnValue({ data: { membership: null } });

    await render(<RootLayout />);

    expect(mockProviderProps).toHaveBeenLastCalledWith(
      expect.objectContaining({ cohortId: null }),
    );
  });

  it("does not fetch the user while signed out", async () => {
    useSessionStore.setState({ status: "unauthenticated", hasInvite: false });
    mockUseMe.mockReturnValue({ data: undefined });

    await render(<RootLayout />);

    expect(mockUseMe).toHaveBeenLastCalledWith({ enabled: false });
    expect(mockProviderProps).toHaveBeenLastCalledWith(
      expect.objectContaining({ cohortId: null }),
    );
  });
});
