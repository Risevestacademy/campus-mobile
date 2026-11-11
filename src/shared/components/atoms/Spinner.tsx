import { cn } from "@shared/utils/style";
import { LoaderCircle } from "lucide-react-native";
import { View } from "react-native";
import Animated, { useReducedMotion } from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { withUniwind } from "uniwind";

const StyledLoaderCircle = withUniwind(LoaderCircle);
// `colorClassName` sets `color`, which the circles pick up as currentColor.
const StyledSvg = withUniwind(Svg);

const SIZES = { sm: 16, md: 20, lg: 32 } as const;

/**
 * A faint full circle with a quarter arc going round it. Strokes are as thick
 * as a lucide icon's at that size, so it sits well beside icons.
 */
function Ring({
  size,
  colorClassName,
}: {
  size: number;
  colorClassName: string;
}) {
  const stroke = Math.max(2, (size * 2) / 24);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const centre = size / 2;

  return (
    <StyledSvg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      colorClassName={colorClassName}
      testID="spinner-ring"
    >
      <Circle
        cx={centre}
        cy={centre}
        r={radius}
        stroke="currentColor"
        strokeOpacity={0.2}
        strokeWidth={stroke}
        fill="none"
      />
      <Circle
        cx={centre}
        cy={centre}
        r={radius}
        stroke="currentColor"
        strokeWidth={stroke}
        strokeDasharray={`${circumference * 0.28} ${circumference}`}
        strokeLinecap="round"
        fill="none"
      />
    </StyledSvg>
  );
}

export interface SpinnerProps {
  /** ring: an arc going round a faint track. arc: the lucide loader arc. */
  variant?: "ring" | "arc";
  /** sm 16, md 20, lg 32, or any number of points. */
  size?: keyof typeof SIZES | number;
  /** The arc's colour, as an accent class. */
  colorClassName?: string;
  /** Placement; the spinner is centred inside. */
  className?: string;
  /** What screen readers announce. */
  accessibilityLabel?: string;
  testID?: string;
}

/**
 * The app's loader: the same spinning arc on iOS and Android, unlike
 * ActivityIndicator, which draws each platform's own control.
 */
export function Spinner({
  variant = "ring",
  size = "md",
  colorClassName = "accent-text-primary",
  className,
  accessibilityLabel = "Loading",
  testID,
}: SpinnerProps) {
  const reduceMotion = useReducedMotion();
  const points = typeof size === "number" ? size : SIZES[size];

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ busy: true }}
      testID={testID}
      className={cn("items-center justify-center", className)}
    >
      <Animated.View
        style={{
          animationName: {
            from: { transform: [{ rotate: "0deg" }] },
            to: { transform: [{ rotate: "360deg" }] },
          },
          animationDuration: reduceMotion ? "1600ms" : "800ms",
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
        }}
      >
        {variant === "ring" ? (
          <Ring size={points} colorClassName={colorClassName} />
        ) : (
          <StyledLoaderCircle size={points} colorClassName={colorClassName} />
        )}
      </Animated.View>
    </View>
  );
}
