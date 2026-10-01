import { render, screen } from "@testing-library/react-native";
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
  it("redirects to the invitation screen", async () => {
    await render(<Index />);

    expect(screen.getByText("redirect:/(auth)/Invitation")).toBeTruthy();
  });
});
