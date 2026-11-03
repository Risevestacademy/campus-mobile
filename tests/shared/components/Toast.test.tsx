import { Toast, toast, ToastShell } from "@shared/components/atoms/Toast";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { RefreshCw } from "lucide-react-native";
import React from "react";
import RNDefaultToast from "react-native-toast-message";

afterEach(() => {
  jest.restoreAllMocks();
});

describe("ToastShell", () => {
  it("shows the feedback pill's message and its action", async () => {
    const onPress = jest.fn();
    await render(
      <ToastShell
        variant="feedback"
        title="Status updated"
        action={{ text: "Undo", onPress }}
      />,
    );

    expect(screen.getByText("Status updated")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Undo" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("shows a card's title and subtitle, and leaves out a missing subtitle", async () => {
    await render(
      <ToastShell
        variant="system"
        tone="danger"
        title="Error"
        subtitle="Nope"
      />,
    );
    expect(screen.getByText("Error")).toBeTruthy();
    expect(screen.getByText("Nope")).toBeTruthy();

    await render(<ToastShell variant="notice" title="Heads up" />);
    expect(screen.getByText("Heads up")).toBeTruthy();
    expect(screen.queryByText("Nope")).toBeNull();
  });

  it("gives a prompt both of its buttons", async () => {
    const accept = jest.fn();
    const decline = jest.fn();
    await render(
      <ToastShell
        variant="prompt"
        title="Ada wants to join"
        primary={{ text: "Let in", onPress: accept }}
        secondary={{ text: "Decline", onPress: decline }}
      />,
    );

    await fireEvent.press(screen.getByRole("button", { name: "Let in" }));
    await fireEvent.press(screen.getByRole("button", { name: "Decline" }));
    expect(accept).toHaveBeenCalledTimes(1);
    expect(decline).toHaveBeenCalledTimes(1);
  });
});

describe("toast", () => {
  it("passes the message through to the renderer", () => {
    const show = jest.spyOn(RNDefaultToast, "show").mockImplementation();

    toast.error("Sign in failed");
    toast.success("Saved");

    expect(show).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "error",
        props: expect.objectContaining({
          params: { title: "Error", message: "Sign in failed" },
        }),
      }),
    );
    expect(show).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "success",
        props: expect.objectContaining({
          params: { message: "Saved", action: undefined },
        }),
      }),
    );
  });

  it("drops cards under the status bar for 4 s, with a countdown", () => {
    const show = jest.spyOn(RNDefaultToast, "show").mockImplementation();

    toast.system({ title: "Update ready" });

    expect(show).toHaveBeenCalledWith(
      expect.objectContaining({
        position: "top",
        autoHide: true,
        visibilityTime: 4000,
        swipeable: true,
        props: expect.objectContaining({
          chrome: expect.objectContaining({
            countdownMs: 4000,
            tapToDismiss: true,
          }),
        }),
      }),
    );
  });

  it("keeps class starting and entry requests until you act", () => {
    const show = jest.spyOn(RNDefaultToast, "show").mockImplementation();

    toast.classStarting({ name: "Design", when: "now", onJoin: jest.fn() });
    toast.entryRequest({
      name: "Cy",
      space: "Library",
      onAccept: jest.fn(),
      onDecline: jest.fn(),
    });

    for (const type of ["classStarting", "entryRequest"]) {
      expect(show).toHaveBeenCalledWith(
        expect.objectContaining({
          type,
          position: "top",
          autoHide: false,
          swipeable: false,
          props: expect.objectContaining({
            chrome: expect.objectContaining({
              countdownMs: undefined,
              tapToDismiss: false,
            }),
          }),
        }),
      );
    }
  });

  it("shows success as a 2 s pill at the bottom, without a countdown", () => {
    const show = jest.spyOn(RNDefaultToast, "show").mockImplementation();

    toast.success("Saved");

    expect(show).toHaveBeenCalledWith(
      expect.objectContaining({
        position: "bottom",
        visibilityTime: 2000,
        props: expect.objectContaining({
          chrome: expect.objectContaining({ countdownMs: undefined }),
        }),
      }),
    );
  });
});

describe("Toast tap and countdown", () => {
  it("opens a card when tapped, then dismisses it", async () => {
    const hide = jest.spyOn(RNDefaultToast, "hide");
    const onOpen = jest.fn();
    await render(<Toast />);

    await act(() =>
      toast.wave({
        name: "Ada",
        space: "Library",
        sentAt: new Date(),
        onWaveBack: jest.fn(),
        onOpen,
      }),
    );
    await fireEvent.press(screen.getByText("Ada waved at you"));

    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(hide).toHaveBeenCalled();
  });

  it("shows the countdown on cards but not on sticky toasts", async () => {
    await render(<Toast />);

    await act(() => toast.system({ title: "Update ready" }));
    expect(screen.getByTestId("toast-countdown")).toBeTruthy();

    await act(() =>
      toast.entryRequest({
        name: "Cy",
        space: "Library",
        onAccept: jest.fn(),
        onDecline: jest.fn(),
      }),
    );
    expect(screen.queryByTestId("toast-countdown")).toBeNull();
  });
});

describe("Toast types", () => {
  it("shows a wave and dismisses it after waving back", async () => {
    const hide = jest.spyOn(RNDefaultToast, "hide");
    const onWaveBack = jest.fn();
    await render(<Toast />);

    await act(() =>
      toast.wave({
        name: "Ada",
        space: "Library",
        sentAt: new Date(2026, 10, 3, 9, 5),
        onWaveBack,
      }),
    );
    expect(screen.getByText("Ada waved at you")).toBeTruthy();
    expect(screen.getByText("Library · 09:05")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Wave back" }));
    expect(onWaveBack).toHaveBeenCalledTimes(1);
    expect(hide).toHaveBeenCalled();
  });

  it("asks to let someone in", async () => {
    const onAccept = jest.fn();
    await render(<Toast />);

    await act(() =>
      toast.entryRequest({
        name: "Cy",
        space: "Library",
        onAccept,
        onDecline: jest.fn(),
      }),
    );
    expect(screen.getByText("Cy wants to join")).toBeTruthy();
    expect(screen.getByText("Library")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Let in" }));
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it("offers to join a class that's starting", async () => {
    const onJoin = jest.fn();
    await render(<Toast />);

    await act(() =>
      toast.classStarting({
        name: "Design Systems",
        when: "in 5 min",
        location: "Studio",
        onJoin,
      }),
    );
    expect(screen.getByText("Design Systems starts in 5 min")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Join" }));
    expect(onJoin).toHaveBeenCalledTimes(1);
  });

  it("shows a notice with its link, and a system message", async () => {
    const onPress = jest.fn();
    await render(<Toast />);

    await act(() =>
      toast.notice({
        title: "Calendar synced",
        action: { text: "View", onPress },
      }),
    );
    await fireEvent.press(screen.getByRole("button", { name: "View" }));
    expect(onPress).toHaveBeenCalledTimes(1);

    await act(() =>
      toast.system({
        title: "Updated",
        message: "Restart to apply",
        icon: RefreshCw,
      }),
    );
    expect(screen.getByText("Restart to apply")).toBeTruthy();
  });
});

describe("message toast", () => {
  it("shows who sent it and what they said, and replies", async () => {
    const onReply = jest.fn();
    await render(<Toast />);

    await act(() => toast.message({ name: "Bo", text: "Coffee?", onReply }));
    expect(screen.getByText("Bo")).toBeTruthy();
    expect(screen.getByText("Coffee?")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Reply to Bo" }));
    expect(onReply).toHaveBeenCalledTimes(1);
  });
});
