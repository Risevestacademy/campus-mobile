import React from "react";

import { useEntryRequestFor } from "../store/entryRequest";

/**
 * Calls `onGone` once the request for `spaceKey` that was open goes away:
 * you walked in after a yes, or it was withdrawn. Not before it existed.
 */
export function useWhenRequestGone(spaceKey: string, onGone: () => void) {
  const request = useEntryRequestFor(spaceKey);
  const seen = React.useRef(request !== null);
  const gone = React.useEffectEvent(onGone);

  React.useEffect(() => {
    if (request) {
      seen.current = true;
    } else if (seen.current) {
      seen.current = false;
      gone();
    }
  }, [request]);
}
