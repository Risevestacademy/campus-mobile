import { render } from "@testing-library/react-native";

import Index from "../../src/app/index";

jest.mock("expo-router", () => ({
  Redirect: jest.fn(() => null),
}));

describe("Index", () => {
  it("redirects to the invitation screen", async () => {
    await render(<Index />);

    expect(screen.getByText("Campus Design System")).toBeTruthy();
  });
});
