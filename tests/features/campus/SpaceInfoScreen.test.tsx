import { SpaceInfoScreen } from "@features/campus";
import { useEntryRequestStore } from "@features/campus/store/entryRequest";
import type { Space } from "@features/campus/types";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

const mockSend = jest.fn(() => true);
const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
    canGoBack: () => true,
  }),
}));

jest.mock("@shared/hooks/useWs", () => ({
  useWs: () => ({
    send: mockSend,
    subscribe: () => () => {},
    status: "open",
    socket: null,
  }),
}));

const space = (overrides: Partial<Space>): Space => ({
  key: "pod-1",
  title: "Study Pod 1",
  subtitle: "",
  people: [],
  youAreHere: false,
  participants: 0,
  status: "empty",
  type: "private",
  ...overrides,
});

describe("SpaceInfoScreen", () => {
  beforeEach(() => {
    mockSend.mockClear();
    mockPush.mockClear();
    useEntryRequestStore.getState().clear();
  });

  it("goes back to the open request instead of asking again", async () => {
    useEntryRequestStore.getState().start("pod-1", "Study Pod 1");
    await render(<SpaceInfoScreen space={space({ status: "locked" })} />);

    await fireEvent.press(screen.getByText("View request"));

    expect(mockSend).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/space/[id]/requst-lobby",
      params: { id: "pod-1" },
    });
  });

  it("offers to ask to join a locked space, walking to its door", async () => {
    await render(
      <SpaceInfoScreen
        space={space({
          status: "locked",
          people: ["Ada", "Bo", "Cy", "Dee"],
          participants: 4,
        })}
      />,
    );

    expect(
      screen.getByText(
        "Locked for a private session. Ask to join and anyone inside can let you in.",
      ),
    ).toBeTruthy();
    expect(screen.getByText("Ada, Bo and 2 others")).toBeTruthy();

    await fireEvent.press(screen.getByText("Ask to join"));

    expect(mockSend).toHaveBeenCalledWith({
      type: "goToSpace",
      spaceKey: "pod-1",
    });
    // The request waits in the lobby.
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/space/[id]/requst-lobby",
      params: { id: "pod-1" },
    });
  });

  it("joins two names with and", async () => {
    await render(
      <SpaceInfoScreen
        space={space({
          status: "occupied",
          people: ["Catherine", "David"],
          participants: 2,
        })}
      />,
    );

    expect(screen.getByText("Catherine and David")).toBeTruthy();
  });

  it("puts you first, and says when it's just you", async () => {
    const { rerender } = await render(
      <SpaceInfoScreen
        space={space({
          people: ["You", "David"],
          youAreHere: true,
          participants: 2,
        })}
      />,
    );
    expect(screen.getByText("You and David")).toBeTruthy();

    await rerender(
      <SpaceInfoScreen
        space={space({ people: ["You"], youAreHere: true, participants: 1 })}
      />,
    );
    expect(screen.getByText("Just you")).toBeTruthy();
  });

  it("walks straight into an open space", async () => {
    await render(<SpaceInfoScreen space={space({ type: "common" })} />);

    expect(screen.getByText("Nobody is here")).toBeTruthy();
    expect(screen.queryByText("Ask to join")).toBeNull();

    await fireEvent.press(screen.getByText("Go there"));

    expect(mockSend).toHaveBeenCalledWith({
      type: "goToSpace",
      spaceKey: "pod-1",
    });
  });

  it("names the meeting on in a live space, and offers to join it", async () => {
    await render(
      <SpaceInfoScreen
        space={space({
          status: "live",
          meeting: "Design crit",
          people: ["Ada"],
          participants: 1,
        })}
      />,
    );

    expect(
      screen.getByText("Design crit is on now. Walk in to join."),
    ).toBeTruthy();
    expect(screen.getByText("Ada")).toBeTruthy();
    expect(screen.getByText("Join")).toBeTruthy();
  });
});
