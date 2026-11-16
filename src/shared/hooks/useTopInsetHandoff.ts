import { setTopInsetCovered } from "@shared/lib/safeAreaInsets";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * While `active`, something at the top of the screen (a banner) is covering
 * the status bar area, so the screens below get a top inset of 0 for the
 * `pt-safe` classes. Restores the real insets afterwards. Inset changes keep
 * coming from the root listener and stay overridden meanwhile.
 */
export function useTopInsetHandoff(active: boolean) {
  const insets = useSafeAreaInsets();
  const currentInsets = React.useEffectEvent(() => insets);

  React.useEffect(() => {
    if (!active) return;
    setTopInsetCovered(true, currentInsets());
    return () => setTopInsetCovered(false);
  }, [active]);
}
