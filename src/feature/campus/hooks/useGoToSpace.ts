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

  // Spaces this hook walked to before the current walk replaced them. Their
  // last frames can still arrive, and must not end the current walk.
  const replaced = React.useRef(new Set<string>());

  const start = (next: Walk | null) => {
    current.current = next;
    setWalk(next);
  };

  React.useEffect(
    () =>
      subscribe((message) => {
        if (message.type !== "walking" && message.type !== "walkEnded") return;
        // going represents the space this hook is walking you to now
        const going = current.current;
        if (!going) return;
        const target = message.toSpaceKey;

        if (target === going.spaceKey) {
          // World handles walks in order, so the replaced ones are over.
          replaced.current.clear();
          if (message.type === "walking") return;
          start(null);
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
          return;
        }

        // A late frame from a walk this one replaced.
        if (target !== null && replaced.current.has(target)) return;

        // Another walk took over, e.g. walking to somebody.
        replaced.current.clear();
        start(null);
      }),
    [subscribe],
  );

  /** Starts the walk; false when campus isn't connected (it says so). */
  const goToSpace = (spaceKey: string, name: string): boolean => {
    if (!send({ type: "goToSpace", spaceKey })) {
      toast.error(
        "You're not connected to campus right now.",
        "Can't walk there",
      );
      return false;
    }
    const previous = current.current;
    if (previous && previous.spaceKey !== spaceKey) {
      replaced.current.add(previous.spaceKey);
    }
    start({ spaceKey, name, socket });
    return true;
  };

  // No `walkEnded` comes once the socket closes, so a walk only counts while
  // the socket it started on is still open.
  const walking = walk && status === "open" && walk.socket === socket;

  return { goToSpace, walkingTo: walking ? walk.spaceKey : null };
}
