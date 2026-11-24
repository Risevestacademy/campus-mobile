import type { ServerMessage } from "@shared/lib/ws";
import { MAX_CHAT_LINES, useChatStore } from "@store/chat";

type Said = Extract<ServerMessage, { type: "said" }>;

const said = (id: string, userId = "u1", text = "hi"): Said => ({
  type: "said",
  id,
  userId,
  spaceKey: "hall",
  text,
  attachment: null,
  at: "2026-11-24T10:00:00.000Z",
});

describe("chat store", () => {
  beforeEach(() => useChatStore.getState().reset());

  it("appends lines in arrival order", () => {
    const { say } = useChatStore.getState();
    say(said("1"), "me");
    say(said("2", "u2", "yo"), "me");
    expect(useChatStore.getState().lines.map((l) => l.id)).toEqual(["1", "2"]);
  });

  it("keeps the file sent with a line", () => {
    const attachment = {
      mediaId: "m1",
      fileName: "notes.pdf",
      contentType: "application/pdf",
      sizeBytes: 1024,
    };
    useChatStore.getState().say({ ...said("1", "u1", ""), attachment }, "me");
    expect(useChatStore.getState().lines[0]).toMatchObject({
      text: "",
      attachment,
    });
  });

  it("ignores a line it already has", () => {
    const { say } = useChatStore.getState();
    say(said("1"), "me");
    say(said("1"), "me");
    expect(useChatStore.getState().lines).toHaveLength(1);
  });

  it("keeps only the newest lines", () => {
    const { say } = useChatStore.getState();
    for (let i = 0; i < MAX_CHAT_LINES + 5; i += 1) say(said(String(i)), "me");
    const { lines } = useChatStore.getState();
    expect(lines).toHaveLength(MAX_CHAT_LINES);
    expect(lines[0]?.id).toBe("5");
  });

  it("counts unread from others only while closed", () => {
    const { say, setOpen } = useChatStore.getState();
    say(said("1", "u1"), "me");
    say(said("2", "me"), "me");
    expect(useChatStore.getState().unread).toBe(1);

    setOpen(true);
    expect(useChatStore.getState().unread).toBe(0);
    say(said("3", "u1"), "me");
    expect(useChatStore.getState().unread).toBe(0);
  });

  it("clear empties the chat but keeps the sheet open", () => {
    const { say, setOpen, clear } = useChatStore.getState();
    setOpen(true);
    say(said("1"), "me");
    clear();
    expect(useChatStore.getState()).toMatchObject({
      lines: [],
      unread: 0,
      open: true,
    });
  });
});
