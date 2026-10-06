import { useSessionStore } from "@store/session";
import { render, screen } from "@testing-library/react-native";
import React from "react";
import { Text as MockText } from "react-native";

import Index from "../../src/app/index";

jest.mock("expo-router", () => {
  return {
    Redirect: ({ href }: { href: string }) => (
      <MockText>redirect:{href}</MockText>
    ),
  };
});

describe("Index", () => {
  beforeEach(() => {
    useSessionStore.setState({ status: "unauthenticated" });
  });

  it("redirects to the sign in screen when unauthenticated", async () => {
    await render(<Index />);

    expect(screen.getByText("redirect:/SignIn")).toBeTruthy();
  });

  it("redirects to campus tabs when authenticated without pending invite", async () => {
    useSessionStore.setState({ status: "authenticated", hasInvite: false });
    await render(<Index />);

    expect(screen.getByText("redirect:/(tabs)/(campus)")).toBeTruthy();
  });

  it("redirects to CreatePassword when authenticated with pending invite", async () => {
    useSessionStore.setState({ status: "authenticated", hasInvite: true });
    await render(<Index />);

    expect(screen.getByText("redirect:/(auth)/CreatePassword")).toBeTruthy();
  });

  it("redirects to SignIn while status is loading so the loader mounts", async () => {
    useSessionStore.setState({ status: "loading" });
    await render(<Index />);

    expect(screen.getByText("redirect:/SignIn")).toBeTruthy();
  });
});
