import { render, screen } from "@testing-library/react-native";

import Index from "../../src/app/index";

describe("Home screen", () => {
  it("shows the Campus product name", async () => {
    await render(<Index />);

    expect(screen.getByText("Rise Campus")).toBeTruthy();
  });
});
