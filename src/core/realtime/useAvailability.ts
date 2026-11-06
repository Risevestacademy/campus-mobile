import { toast } from "@shared/components/atoms";
import { useWs } from "@shared/hooks/useWs";
import type { Status } from "@shared/lib/generated/world-protocol";
import { useMyStatus, useMyStatusUntil } from "@store/world";

/**
 * Your status as world last reported it, when it ends if you chose it for a
 * while, and a way to change it. A change shows once world echoes it back
 * as `statusChanged`, not before.
 */
export function useAvailability() {
  const { send } = useWs();
  const status = useMyStatus();
  const until = useMyStatusUntil();

  /** `forSeconds` sets it for that long only; leave it out for one that lasts. */
  const setStatus = (next: Status, forSeconds?: number) => {
    const sent = send({
      type: "setStatus",
      status: next,
      ...(forSeconds ? { forSeconds } : {}),
    });
    if (!sent) {
      toast.error("You're not connected to campus. Try again in a moment.");
    }
  };

  return { status, until, setStatus };
}
