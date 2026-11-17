import { useWs } from "@shared/hooks/useWs";
import { useStandingEmpty, useWorldStore } from "@store/world";
import React from "react";

const FIRST_RETRY_MS = 2_000;
const MAX_RETRY_MS = 30_000;

/** Straight away, then backing off while world still holds the avatar. */
export function claimDelay(attempt: number) {
  if (attempt === 0) return 0;
  return Math.min(FIRST_RETRY_MS * 2 ** (attempt - 1), MAX_RETRY_MS);
}

/**
 * While watching, the device that stood for you may leave. World never hands
 * the avatar to a watcher by itself, so reconnect with ifFree: that takes it
 * when it's free and keeps watching when it isn't (a dropped device's avatar
 * is held for a while), in which case try again later.
 */
export function useClaimEmptyAvatar() {
  const empty = useStandingEmpty();
  const standing = useWorldStore((state) => state.mode === "avatar");
  const { reconnect } = useWs();
  const attempt = React.useRef(0);

  React.useEffect(() => {
    if (standing) attempt.current = 0;
  }, [standing]);

  React.useEffect(() => {
    if (!empty) return;
    const timer = setTimeout(() => {
      attempt.current += 1;
      reconnect("ifFree");
    }, claimDelay(attempt.current));
    return () => clearTimeout(timer);
  }, [empty, reconnect]);
}
