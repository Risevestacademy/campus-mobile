import { toast } from "@shared/components/atoms";
import { useWs } from "@shared/hooks/useWs";
import type { Status } from "@shared/lib/generated/world-protocol";
import { useMyStatus } from "@store/world";

/**
 * Your status as world last reported it, and a way to change it. A change
 * shows once world echoes it back as `statusChanged`, not before.
 */
export function useAvailability() {
  const { send } = useWs();
  const status = useMyStatus();

  const setStatus = (next: Status) => {
    if (!send({ type: "setStatus", status: next })) {
      toast.error("You're not connected to campus. Try again in a moment.");
    }
  };

  return { status, setStatus };
}
