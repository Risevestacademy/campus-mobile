import { cn } from "@shared/utils/style";
import { Pressable } from "react-native";
import Animated, { useReducedMotion } from "react-native-reanimated";
import { useCSSVariable } from "uniwind";

const TRACK_WIDTH = 44;
const TRACK_HEIGHT = 26;
const INSET = 3;
const THUMB = TRACK_HEIGHT - INSET * 2;
const TRAVEL = TRACK_WIDTH - THUMB - INSET * 2;

type SwitchProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  className?: string;
};

/**
 * An on/off toggle. The thumb slides and the track changes colour as a
 * Reanimated CSS transition, on the UI thread; with Reduce Motion on it
 * switches at once.
 */
export function Switch({
  value,
  onChange,
  disabled = false,
  accessibilityLabel,
  className,
}: SwitchProps) {
  const reduceMotion = useReducedMotion();
  const offColor = useCSSVariable("--color-border-strong") as string;
  const onColor = useCSSVariable("--color-action-primary") as string;
  const transition = {
    transitionDuration: reduceMotion ? 0 : 200,
    transitionTimingFunction: "ease-out",
  } as const;

  return (
    <Pressable
      onPress={() => onChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      hitSlop={8}
      className={cn(disabled && "opacity-50", className)}
      testID="switch"
    >
      <Animated.View
        style={{
          width: TRACK_WIDTH,
          height: TRACK_HEIGHT,
          padding: INSET,
          borderRadius: 100,
          backgroundColor: value ? onColor : offColor,
          transitionProperty: "backgroundColor",
          ...transition,
        }}
      >
        <Animated.View
          className="bg-bg-on-colour shadow-sm"
          style={{
            width: THUMB,
            height: THUMB,
            borderRadius: THUMB / 2,
            transform: [{ translateX: value ? TRAVEL : 0 }],
            transitionProperty: "transform",
            ...transition,
          }}
        />
      </Animated.View>
    </Pressable>
  );
}
