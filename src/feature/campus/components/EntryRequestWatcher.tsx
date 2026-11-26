import { useEntryRequestWatcher } from "../hooks/useEntryRequestWatcher";

/**
 * Follows your request to enter a locked space app-wide, so its answer
 * arrives wherever you are. Mount once, inside the signed-in app. Renders
 * nothing.
 */
export function EntryRequestWatcher() {
  useEntryRequestWatcher();
  return null;
}
