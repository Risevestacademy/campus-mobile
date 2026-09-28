import { render } from "@testing-library/react-native";
import { Redirect } from "expo-router";

import Index from "../../src/app/index";

jest.mock("expo-router", () => ({
  Redirect: jest.fn(() => null),
}));

describe("Index", () => {
  it("redirects to the invitation screen", async () => {
    await render(<Index />);

    const props = (Redirect as jest.Mock).mock.calls[0][0];
    expect(props).toEqual({ href: "/(auth)/Invitation" });
  });
});
