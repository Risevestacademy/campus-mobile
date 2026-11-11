import type { EdgeInsets } from "react-native-safe-area-context";
import { Uniwind } from "uniwind";

// The one place that hands insets to Uniwind (`pt-safe` and friends), so the
// root listener and a banner covering the status bar can't overwrite each other.
let latest: EdgeInsets | null = null;
let topCovered = false;

function push() {
  if (!latest) return;
  Uniwind.updateInsets(topCovered ? { ...latest, top: 0 } : latest);
}

/** The device's insets, from the root SafeAreaListener on every change. */
export function applySafeAreaInsets(insets: EdgeInsets) {
  latest = insets;
  push();
}

/**
 * Something at the top of the screen (a banner) covers the status bar area,
 * so screens get a top inset of 0 until it's uncovered. `fallback` is used
 * only until the root listener has reported.
 */
export function setTopInsetCovered(covered: boolean, fallback?: EdgeInsets) {
  topCovered = covered;
  latest ??= fallback ?? null;
  push();
}
