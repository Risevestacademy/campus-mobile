import { toast } from "@shared/components/atoms";
import { useWs } from "@shared/hooks/useWs";
import { useChatStore } from "@store/chat";
import { useWorldStore } from "@store/world";
import React from "react";

/** Matches world's `say` limit. */
export const MAX_CHAT_LENGTH = 500;

/**
 * How long after a `say` an `error` frame counts as its answer. Frames carry
 * no id to match them by, as with `setStatus`.
 */
const ANSWER_WINDOW_MS = 3_000;

export interface ChatMessage {
  id: string;
  userId: string;
  name: string;
  text: string;
  /** The name of the file sent with it, if any. */
  attachmentName: string | null;
  timestamp: number;
  isLocal: boolean;
}

/** Whether chat can be used: the world socket is open. */
export function useChatConnected() {
  const { status } = useWs();
  return status === "open";
}

/**
 * The space's group chat over the world socket: `say` out, `said` back, and
 * your own line comes back the same way, so nothing is added locally. World
 * keeps no history; the lines are only those that arrived since you entered
 * the space.
 */
export function useRoomChat() {
  const { send: sendFrame, subscribe } = useWs();
  const connected = useChatConnected();
  const lines = useChatStore((state) => state.lines);
  const selfId = useWorldStore((state) => state.selfId);
  const players = useWorldStore((state) => state.players);
  const sentAt = React.useRef<number | null>(null);

  React.useEffect(
    () =>
      subscribe((message) => {
        if (sentAt.current === null) return;
        if (Date.now() - sentAt.current > ANSWER_WINDOW_MS) {
          sentAt.current = null;
          return;
        }
        if (message.type === "said" && message.userId === selfId) {
          sentAt.current = null;
        } else if (
          message.type === "error" &&
          message.code !== "UNAUTHORIZED"
        ) {
          sentAt.current = null;
          console.warn("World refused say:", message.message);
          toast.error("Slow down a little and try again.", "Not sent");
        }
      }),
    [subscribe, selfId],
  );

  const messages = React.useMemo<ChatMessage[]>(
    () =>
      lines.map((line) => ({
        id: line.id,
        userId: line.userId,
        name: players[line.userId]?.displayName || "Guest",
        text: line.text,
        attachmentName: line.attachment
          ? (line.attachment.fileName ?? "File")
          : null,
        timestamp: Date.parse(line.at),
        isLocal: line.userId === selfId,
      })),
    [lines, players, selfId],
  );

  /** Returns false when nothing was sent. */
  const send = React.useCallback(
    (raw: string): boolean => {
      const text = raw.trim();
      if (!text || text.length > MAX_CHAT_LENGTH) return false;
      const sent = sendFrame({ type: "say", text });
      if (!sent) {
        toast.error("You're not connected to campus. Try again in a moment.");
        return false;
      }
      sentAt.current = Date.now();
      return true;
    },
    [sendFrame],
  );

  return { messages, send, connected };
}
