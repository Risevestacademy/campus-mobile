import { Button } from "@shared/components/atoms";
import {
  type MeetingJoinData,
  MeetingJoinProvider,
  useMeetingJoin,
} from "@shared/hooks/ui";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const meeting: MeetingJoinData = {
  meetingId: "design-foundations",
  title: "Design Foundations",
  location: "Classroom A",
  participants: [{ name: "Ada" }],
};

function Opener() {
  const { open } = useMeetingJoin();
  return <Button label="Open meeting" onPress={() => open(meeting)} />;
}

describe("useMeetingJoin", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("joins the meeting room exactly once on repeated presses", async () => {
    await render(
      <MeetingJoinProvider>
        <Opener />
      </MeetingJoinProvider>,
    );

    await fireEvent.press(screen.getByText("Open meeting"));
    const join = screen.getByText("Join");

    await fireEvent.press(join);
    await fireEvent.press(join);
    // Outlast the Button's own press throttle so only the join guard is left
    await act(() => jest.advanceTimersByTime(1000));
    await fireEvent.press(join);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/(tabs)/(campus)/space/[id]",
      params: { id: "design-foundations" },
    });
  });
});
