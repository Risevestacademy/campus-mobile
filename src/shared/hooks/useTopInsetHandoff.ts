import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Uniwind } from "uniwind";

/**
 * While `active`, something at the top of the screen (a banner) is covering
 * the status bar area, so the screens below get a top inset of 0 for the
 * `pt-safe` classes. Restores the real insets afterwards.
 */
export function useTopInsetHandoff(active: boolean) {
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    if (!active) return;
    Uniwind.updateInsets({ ...insets, top: 0 });
    return () => Uniwind.updateInsets(insets);
  }, [active, insets]);
}
