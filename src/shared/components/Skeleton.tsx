import { cn } from "@shared/utils/style";
import type { ReactElement } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useReducedMotion } from "react-native-reanimated";

type SkeletonProps = {
  /** Exactly one element; its own size gives the placeholder its shape. */
  children: ReactElement;
  isLoading?: boolean;
  width?: number;
  height?: number;
  radius?: number | "round" | "square";
  /** Placement or size of the placeholder, for a child that can't set its own. */
  className?: string;
  /** The placeholder's colour. */
  colorClassName?: string;
};

const PULSE = {
  animationName: { from: { opacity: 1 }, to: { opacity: 0.5 } },
  animationDuration: "800ms",
  animationIterationCount: "infinite",
  animationDirection: "alternate",
  animationTimingFunction: "ease-in-out",
} as const;

function borderRadius(radius: SkeletonProps["radius"]) {
  if (radius === "round") return 9999;
  if (radius === "square") return 0;
  return radius;
}

/**
 * A pulsing placeholder in the shape of `children` while `isLoading`. The
 * child stays rendered, invisibly, to give it its size; once loaded it is
 * returned as it is, with nothing wrapped around it.
 */
export function Skeleton({
  children,
  isLoading = false,
  width,
  height,
  radius = 16,
  className,
  colorClassName = "bg-bg-ink-soft",
}: SkeletonProps) {
  const reduceMotion = useReducedMotion();

  if (!isLoading) return children;

  return (
    <View
      accessible
      accessibilityLabel="Loading"
      accessibilityState={{ busy: true }}
      className={cn("overflow-hidden", className)}
      style={{ width, height, borderRadius: borderRadius(radius) }}
      testID="skeleton"
    >
      <View
        style={{ opacity: 0 }}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {children}
      </View>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          reduceMotion ? { opacity: 0.75 } : PULSE,
        ]}
        className={colorClassName}
        testID="skeleton-placeholder"
      />
    </View>
  );
}
