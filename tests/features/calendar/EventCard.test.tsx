import { EventCard } from "@features/calendar/components";
import type { CalendarEvent } from "@features/calendar/types";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

const live: CalendarEvent = {
  id: "e1",
  title: "Backend standup",
  start: "2026-10-27T09:00:00Z",
  end: "2026-10-27T09:30:00Z",
  location: "Room 2",
  live: true,
};

describe("EventCard", () => {
  it("offers Join on a live event with a meeting link", async () => {
    const onJoin = jest.fn();
    const event = { ...live, meetingUrl: "https://meet.google.com/abc" };
    await render(<EventCard event={event} onJoin={onJoin} />);

    await fireEvent.press(screen.getByText("Join"));

    expect(onJoin).toHaveBeenCalledWith(event);
  });

  it("leaves Join out when there is no meeting link", async () => {
    await render(<EventCard event={{ ...live, meetingUrl: null }} />);

    expect(screen.getByText("LIVE")).toBeTruthy();
    expect(screen.queryByText("Join")).toBeNull();
  });
});
