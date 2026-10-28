import React from "react";
import type { LayoutChangeEvent } from "react-native";
import {
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

/** Used until the count and location have been measured. */
const FALLBACK_DISTANCE = 80;

/**
 * Scroll-driven collapse for the campus header. `progress` runs 0 → 1 over
 * the height of the count and location, which travel into the pinned bar
 * meanwhile. `collapsed` flips only at the halfway point, for things that
 * can't be animated, like whether a view takes taps or is read aloud.
 */
export function useCollapsingHeader() {
  const scrollY = useSharedValue(0);
  /** Top of the count and location within the scroll content. */
  const summaryY = useSharedValue(0);
  const distance = useSharedValue(FALLBACK_DISTANCE);
  const [collapsed, setCollapsed] = React.useState(false);
  const [barHeight, setBarHeight] = React.useState(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // Clamped, so iOS bounce and overscroll never push past either end.
  const progress = useDerivedValue(() =>
    interpolate(
      scrollY.value,
      [0, distance.value],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  );

  useAnimatedReaction(
    () => progress.value > 0.5,
    (isCollapsed, wasCollapsed) => {
      if (isCollapsed !== wasCollapsed) scheduleOnRN(setCollapsed, isCollapsed);
    },
  );

  const onSummaryLayout = (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    summaryY.set(y);
    if (height > 0) distance.set(height);
  };

  const onBarLayout = (event: LayoutChangeEvent) => {
    setBarHeight(event.nativeEvent.layout.height);
  };

  return {
    onScroll,
    scrollY,
    summaryY,
    progress,
    collapsed,
    barHeight,
    onBarLayout,
    onSummaryLayout,
  };
}
