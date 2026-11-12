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
});
