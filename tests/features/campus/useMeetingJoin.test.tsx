import { Button } from "@shared/components/atoms";
import {
  type MeetingJoinData,
  MeetingJoinProvider,
  useMeetingJoin,
} from "@shared/hooks/ui";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

const meeting: MeetingJoinData = {
  spaceKey: "design-foundations",
  title: "Design Foundations",
  location: "Classroom A",
  participants: [{ name: "Ada" }],
};

function Opener({ data = meeting }: { data?: MeetingJoinData }) {
  const { open } = useMeetingJoin();
  return <Button label="Open meeting" onPress={() => open(data)} />;
}

describe("useMeetingJoin", () => {
  it("shows the meeting's details without a way to join", async () => {
    await render(
      <MeetingJoinProvider>
        <Opener />
      </MeetingJoinProvider>,
    );

    await fireEvent.press(screen.getByText("Open meeting"));

    expect(screen.getByText("Design Foundations")).toBeTruthy();
    expect(screen.getByText("Close")).toBeTruthy();
    expect(screen.queryByText("Join")).toBeNull();
  });

  it("runs the meeting's own join step once, then opens its space", async () => {
    const onJoin = jest.fn();
    await render(
      <MeetingJoinProvider>
        <Opener data={{ ...meeting, spaceKey: "campus-space-id", onJoin }} />
      </MeetingJoinProvider>,
    );

    await fireEvent.press(screen.getByText("Open meeting"));
    const join = screen.getByText("Join");
    await fireEvent.press(join);
    await act(() => jest.advanceTimersByTime(1000));
    await fireEvent.press(join);

    expect(onJoin).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenLastCalledWith({
      pathname: "/(app)/(tabs)/(campus)/space/[id]",
      params: { id: "campus-space-id" },
    });
  });
});
