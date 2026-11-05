import { toast } from "@shared/components/atoms";
import { useWs } from "@shared/hooks/useWs";
import React from "react";

type Walk = { spaceKey: string; name: string; socket: WebSocket | null };

/**
 * Has the server walk you into a space (`goToSpace`), and says why if you
 * don't get there. `walkingTo` is the space key while the walk is going.
 */
export function useGoToSpace() {
  const { send, subscribe, status, socket } = useWs();
  const [walk, setWalk] = React.useState<Walk | null>(null);
  // The socket listener outlives renders, so it reads the walk from here.
  const current = React.useRef<Walk | null>(null);

  const start = (next: Walk | null) => {
    current.current = next;
    setWalk(next);
  };

  React.useEffect(
    () =>
      subscribe((message) => {
        // going represents the current space a particpant is moving to
        const going = current.current;
        if (!going) return;
        // Another walk took over, e.g. walking to somebody.
        if (
          message.type === "walking" &&
          message.toSpaceKey !== going.spaceKey
        ) {
          current.current = null;
          setWalk(null);
          return;
        }
        if (message.type !== "walkEnded") return;
        current.current = null;
        setWalk(null);
        if (message.toSpaceKey !== going.spaceKey) return;
        if (message.reason === "refused") {
          toast.error(
            `${going.name} is closed to you right now.`,
            "Can't get in",
          );
        } else if (message.reason === "no_way") {
          toast.error(
            `There's no way through to ${going.name}.`,
            "Can't get there",
          );
        }
      }),
    [subscribe],
  );

  const goToSpace = (spaceKey: string, name: string) => {
    if (!send({ type: "goToSpace", spaceKey })) {
      toast.error(
        "You're not connected to campus right now.",
        "Can't walk there",
      );
      return;
    }
    start({ spaceKey, name, socket });
  };

  // No `walkEnded` comes once the socket closes, so a walk only counts while
  // the socket it started on is still open.
  const walking = walk && status === "open" && walk.socket === socket;

  return { goToSpace, walkingTo: walking ? walk.spaceKey : null };
}
