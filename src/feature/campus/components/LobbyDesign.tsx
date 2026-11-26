import { cn } from "@shared/utils/style";
import { View } from "react-native";
import Animated, { useReducedMotion } from "react-native-reanimated";

/** The drawing's box; the shapes are placed inside it. */
const WIDTH = 280;
const HEIGHT = 250;

type Shape = {
  /** Outer diameter. */
  size: number;
  /** A donut's ring: (outer − inner) / 2. A solid has none. */
  ring?: number;
  className: string;
  /** Centre, in the drawing's box. */
  x: number;
  y: number;
  /** How the shape drifts: how far, and over how long. */
  drift: { x: number; y: number; ms: number; delayMs: number };
};

/**
 * Around the solid in the middle: turquoise to its top left, accent to its
 * top right, on-colour to its bottom right. Donuts first, so the solid sits
 * over their edges.
 */
const SHAPES: Shape[] = [
  {
    // 1. Turquoise donut: outer 75, inner 25.
    size: 75,
    ring: (75 - 25) / 2,
    className: "border-identity-turquoise",
    x: 58,
    y: 52,
    drift: { x: 6, y: -9, ms: 2300, delayMs: 0 },
  },
  {
    // 3. Accent donut: outer 56, inner 20.
    size: 56,
    ring: (56 - 20) / 2,
    className: "border-action-accent",
    x: 226,
    y: 44,
    drift: { x: -5, y: -10, ms: 1900, delayMs: 300 },
  },
  {
    // 4. On-colour donut: outer 72, inner 26.
    size: 72,
    ring: (72 - 26) / 2,
    className: "border-bg-on-colour",
    x: 222,
    y: 204,
    drift: { x: -7, y: 8, ms: 2600, delayMs: 600 },
  },
  {
    // 2. Coral solid, 112, with a 5px on-colour border: in between all.
    size: 112,
    className: "bg-text-coral border-[5px] border-bg-on-colour",
    x: WIDTH / 2,
    y: HEIGHT / 2,
    drift: { x: 0, y: -6, ms: 2100, delayMs: 150 },
  },
];

/** A back-and-forth drift, eased, looping for good. */
function bounce({ x, y, ms, delayMs }: Shape["drift"]) {
  return {
    animationName: {
      from: { transform: [{ translateX: 0 }, { translateY: 0 }] },
      to: { transform: [{ translateX: x }, { translateY: y }] },
    },
    animationDuration: `${ms}ms`,
    animationDelay: `${delayMs}ms`,
    animationIterationCount: "infinite",
    animationDirection: "alternate",
    animationTimingFunction: "ease-in-out",
  } as const;
}

/**
 * The lobby's drawing: four rounds drifting around each other while you
 * wait. Decorative, so hidden from screen readers. Still when `animate` is
 * false (the wait is over) and under Reduce Motion.
 */
export function LobbyDesign({ animate = true }: { animate?: boolean }) {
  const reduceMotion = useReducedMotion();
  const moving = animate && !reduceMotion;

  return (
    <View
      style={{ width: WIDTH, height: HEIGHT }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID="lobby-design"
    >
      {SHAPES.map((shape) => (
        <Animated.View
          key={shape.className}
          className={cn("absolute rounded-full", shape.className)}
          style={[
            {
              width: shape.size,
              height: shape.size,
              left: shape.x - shape.size / 2,
              top: shape.y - shape.size / 2,
            },
            shape.ring !== undefined
              ? { borderWidth: shape.ring, backgroundColor: "transparent" }
              : null,
            moving ? bounce(shape.drift) : null,
          ]}
        />
      ))}
    </View>
  );
}
