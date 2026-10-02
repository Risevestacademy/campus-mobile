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
  it("redirects to the sign in screen", async () => {
    await render(<Index />);

    expect(screen.getByText("redirect:/SignIn")).toBeTruthy();
  });
});
