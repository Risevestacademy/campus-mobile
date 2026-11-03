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

/** Used until the hero has been measured. */
const FALLBACK_DISTANCE = 112;

/**
 * Scroll-driven collapse for the campus header. `progress` runs 0 → 1 over
 * the height of the hero (the band block holding the count and location),
 * which travel into the pinned bar meanwhile. `collapsed` flips only at the halfway point, for things that
 * can't be animated, like whether a view takes taps or is read aloud.
 */
export function useCollapsingHeader() {
  const scrollY = useSharedValue(0);
  /** Top of the count and location within the scroll content. */
  const summaryY = useSharedValue(0);
  const distance = useSharedValue(FALLBACK_DISTANCE);
  const [collapsed, setCollapsed] = React.useState(false);
  const [barHeight, setBarHeight] = React.useState(0);
  const [heroHeight, setHeroHeight] = React.useState(0);
  const [viewportHeight, setViewportHeight] = React.useState(0);

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
    summaryY.set(event.nativeEvent.layout.y);
  };

  // The whole band block, padding included, so it's fully under the bar once
  // collapsed instead of leaving a strip of band showing below it.
  const onHeroLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) distance.set(height);
    setHeroHeight(height);
  };

  const onViewportLayout = (event: LayoutChangeEvent) => {
    setViewportHeight(event.nativeEvent.layout.height);
  };

  const onBarLayout = (event: LayoutChangeEvent) => {
    setBarHeight(event.nativeEvent.layout.height);
  };

  /**
   * Props for the scroll view. Short content must still scroll the whole
   * collapse, or it stops partway with the compact count half faded in; and
   * it settles fully expanded or fully collapsed, never in between.
   */
  const scrollProps = {
    onScroll,
    onLayout: onViewportLayout,
    scrollEventThrottle: 16,
    snapToOffsets: heroHeight > 0 ? [0, heroHeight] : undefined,
    snapToEnd: false,
    contentContainerStyle: {
      paddingTop: barHeight,
      minHeight: viewportHeight + heroHeight,
    },
  };

  return {
    scrollProps,
    onScroll,
    scrollY,
    summaryY,
    progress,
    collapsed,
    barHeight,
    onBarLayout,
    onSummaryLayout,
    onHeroLayout,
  };
}
