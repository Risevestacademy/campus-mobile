import type { ServerMessage } from "@shared/lib/ws";
import { useChatStore } from "@store/chat";
import { useWorldStore } from "@store/world";
import { act, renderHook } from "@testing-library/react-native";

import {
  MAX_CHAT_LENGTH,
  useRoomChat,
} from "../../../src/feature/room/hooks/useRoomChat";

const mockListeners = new Set<(message: ServerMessage) => void>();
const mockSend = jest.fn(() => true);
const mockToastError = jest.fn();

jest.mock("@shared/hooks/useWs", () => ({
  useWs: () => ({
    status: "open",
    send: mockSend,
    subscribe: (listener: (message: ServerMessage) => void) => {
      mockListeners.add(listener);
      return () => mockListeners.delete(listener);
    },
  }),
}));

jest.mock("@shared/components/atoms", () => ({
  toast: { error: (...args: unknown[]) => mockToastError(...args) },
}));

const emit = (message: unknown) =>
  act(() =>
    mockListeners.forEach((listener) => listener(message as ServerMessage)),
  );

describe("useRoomChat", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "warn").mockImplementation(() => {});
    mockListeners.clear();
    mockSend.mockReturnValue(true);
    useChatStore.getState().reset();
    useWorldStore.getState().reset();
    useWorldStore
      .getState()
      .apply({ type: "welcome", userId: "me" } as ServerMessage);
  });

  afterEach(() => jest.restoreAllMocks());

  it("sends trimmed text as a say frame", async () => {
    const { result } = await renderHook(() => useRoomChat());
    let sent = false;
    await act(async () => {
      sent = result.current.send("  hello  ");
    });
    expect(sent).toBe(true);
    expect(mockSend).toHaveBeenCalledWith({ type: "say", text: "hello" });
  });

  it("does not send blank or over-long text", async () => {
    const { result } = await renderHook(() => useRoomChat());
    await act(async () => {
      expect(result.current.send("   ")).toBe(false);
      expect(result.current.send("x".repeat(MAX_CHAT_LENGTH + 1))).toBe(false);
    });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("says so when the socket is not open", async () => {
    mockSend.mockReturnValue(false);
    const { result } = await renderHook(() => useRoomChat());
    await act(async () => {
      expect(result.current.send("hi")).toBe(false);
    });
    expect(mockToastError).toHaveBeenCalled();
  });

  it("names the sender and marks your own line", async () => {
    useWorldStore.getState().apply({
      type: "snapshot",
      players: [
        {
          userId: "u1",
          displayName: "Ada",
          status: "available",
          spaceKey: "hall",
        },
      ],
      spaces: [],
      lockedSpaces: [],
    } as unknown as ServerMessage);
    const said = (id: string, userId: string) => ({
      type: "said",
      id,
      userId,
      spaceKey: "hall",
      text: id,
      at: "2026-11-24T10:00:00.000Z",
    });
    const { result } = await renderHook(() => useRoomChat());
    await act(async () => {
      useChatStore.getState().say(said("a", "u1") as never, "me");
      useChatStore.getState().say(said("b", "me") as never, "me");
    });
    expect(result.current.messages).toMatchObject([
      { id: "a", name: "Ada", isLocal: false },
      { id: "b", isLocal: true },
    ]);
  });

  it("shows a line that is only a file by the file's name", async () => {
    const { result } = await renderHook(() => useRoomChat());
    await act(async () => {
      useChatStore.getState().say(
        {
          type: "said",
          id: "f",
          userId: "u1",
          spaceKey: "hall",
          text: "",
          attachment: {
            mediaId: "m1",
            fileName: "notes.pdf",
            contentType: "application/pdf",
            sizeBytes: 1,
          },
          at: "2026-11-24T10:00:00.000Z",
        },
        "me",
      );
    });
    expect(result.current.messages[0]).toMatchObject({
      text: "",
      attachmentName: "notes.pdf",
    });
  });

  it("toasts when world refuses a say", async () => {
    const { result } = await renderHook(() => useRoomChat());
    await act(async () => {
      result.current.send("hi");
    });
    await emit({ type: "error", code: "NOT_ALLOWED", message: "too fast" });
    expect(mockToastError).toHaveBeenCalledWith(expect.any(String), "Not sent");
  });
});
