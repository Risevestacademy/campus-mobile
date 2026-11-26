import { RequestLobbyScreen } from "@features/campus";
import { useEntryRequestStore } from "@features/campus/store/entryRequest";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

const mockSend = jest.fn(() => true);
const mockBack = jest.fn();
const mockDismissTo = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: mockBack,
    dismissTo: mockDismissTo,
    canGoBack: () => true,
  }),
}));

jest.mock("@shared/hooks/useWs", () => ({
  useWs: () => ({ send: mockSend, subscribe: () => () => {} }),
}));

function waiting() {
  const store = useEntryRequestStore.getState();
  store.start("pod-1", "Study Pod 1");
  store.update({ phase: "waiting", requestId: "req-1" });
}

const renderLobby = () =>
  render(<RequestLobbyScreen spaceKey="pod-1" spaceName="Study Pod 1" />);

describe("RequestLobbyScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEntryRequestStore.getState().clear();
  });

  it("says the request is sent and who it waits for", async () => {
    waiting();
    await renderLobby();

    expect(screen.getByText("Request sent")).toBeTruthy();
    expect(screen.getByText("Waiting for host to let you in")).toBeTruthy();
    expect(
      screen.getByText(
        "You can leave this screen. We’ll ping you the moment they answer.",
      ),
    ).toBeTruthy();
  });

  it("goes back to campus and leaves the request open", async () => {
    waiting();
    await renderLobby();

    await fireEvent.press(screen.getByText("Back to campus"));

    expect(mockDismissTo).toHaveBeenCalledWith("/(app)/(tabs)/(campus)");
    expect(mockSend).not.toHaveBeenCalled();
    expect(useEntryRequestStore.getState().request?.phase).toBe("waiting");
  });

  it("cancels the request and goes back", async () => {
    waiting();
    await renderLobby();

    await fireEvent.press(screen.getByText("Cancel request"));

    expect(mockSend).toHaveBeenCalledWith({
      type: "withdrawEntryRequest",
      requestId: "req-1",
    });
    expect(mockBack).toHaveBeenCalledTimes(1);

    // World confirms; leaving again would pop a second screen.
    await act(() => useEntryRequestStore.getState().clear());
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("leaves by itself once you've been let in and walked through", async () => {
    waiting();
    await renderLobby();

    await act(() => useEntryRequestStore.getState().clear());

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("says why when you weren't let in", async () => {
    waiting();
    useEntryRequestStore.getState().update({
      phase: "ended",
      reason: "They said no this time. You can ask again in 30 seconds.",
    });
    await renderLobby();

    expect(screen.getByText("You weren't let in")).toBeTruthy();
    expect(
      screen.getByText(
        "They said no this time. You can ask again in 30 seconds.",
      ),
    ).toBeTruthy();
    expect(screen.getByText("Close")).toBeTruthy();
  });
});
