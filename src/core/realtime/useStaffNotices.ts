import { toast } from "@shared/components/atoms";
import { useWs } from "@shared/hooks/useWs";
import { useWorldStore } from "@store/world";
import React from "react";

/** "09:05", as times read elsewhere in the app. */
function clock(iso: string) {
  const date = new Date(iso);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/**
 * Says so when staff act on you: they muted your microphone (world switches
 * it off in the call, and you may turn it back on), or moved you out of a
 * space (you stay out until the time given, and may ask to come back in
 * meanwhile). Staff actions on other people are not for you to see.
 */
export function useStaffNotices() {
  const { subscribe } = useWs();

  React.useEffect(
    () =>
      subscribe((message) => {
        if (message.type !== "staffAction") return;
        if (message.userId !== useWorldStore.getState().selfId) return;
        if (message.action === "muted") {
          toast.system({
            title: "You were muted",
            message:
              "A staff member switched off your microphone. You can turn it back on.",
          });
        } else {
          toast.system({
            title: "Moved out of the space",
            message: message.until
              ? `A staff member moved you out. You can ask to enter again at ${clock(message.until)}.`
              : "A staff member moved you out.",
          });
        }
      }),
    [subscribe],
  );
}
