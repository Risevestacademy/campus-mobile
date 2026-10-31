import { type ComponentProps } from "react";
import { type LayoutChangeEvent, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  clamp,
  Easing,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OngoingCall } from "./OngoingCall";

/** Keeps the call this far below the top safe area while dragging. */
const EDGE = 8;
/** How far a flick carries it past where the finger let go, per px/s. */
const FLING = 0.15;
/** Settles without overshooting: no bounce at the end of a drag. */
const SETTLE = { damping: 30, stiffness: 220, overshootClamping: true };
const SLIDE_MS = 250;

type FloatingCallProps = {
  /** The call to show, or null for none; it slides in and out as this changes. */
  call: Omit<ComponentProps<typeof OngoingCall>, "className"> | null;
  /** Distance from the bottom of the screen to where the call rests. */
  bottomOffset: number;
};

/**
 * An ongoing call floating over the app, the full width of the screen. It
 * slides straight up when a call starts and back down when it ends. It rests
 * `bottomOffset` above the bottom and can be dragged up and down, from there
 * to just under the top safe area: it lifts slightly while held and glides
 * to a stop, carrying a flick. Touches anywhere else go through to the app.
 * Stays mounted so the exit can play.
 */
export function FloatingCall({ call, bottomOffset }: FloatingCallProps) {
  const { top } = useSafeAreaInsets();

  // Dragged distance from where it rests, and where it rests.
  const offsetY = useSharedValue(0);
  const startY = useSharedValue(0);
  const restY = useSharedValue(0);
  // 0 resting, 1 held.
  const lift = useSharedValue(0);

  const drag = Gesture.Pan()
    .onBegin(() => {
      lift.value = withSpring(1, SETTLE);
    })
    .onStart(() => {
      startY.value = offsetY.value;
    })
    .onUpdate((event) => {
      // Up to the safe area, and never lower than where it rests.
      offsetY.value = clamp(
        startY.value + event.translationY,
        top + EDGE - restY.value,
        0,
      );
    })
    .onEnd((event) => {
      const target = clamp(
        offsetY.value + event.velocityY * FLING,
        top + EDGE - restY.value,
        0,
      );
      offsetY.value = withSpring(target, {
        ...SETTLE,
        velocity: event.velocityY,
      });
    })
    .onFinalize(() => {
      lift.value = withSpring(0, SETTLE);
    });

  const dragStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: offsetY.value },
      { scale: 1 + 0.03 * lift.value },
    ],
  }));

  const onBoxLayout = (event: LayoutChangeEvent) => {
    restY.set(event.nativeEvent.layout.y);
  };

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="box-none"
      className="mx-4"
    >
      {call ? (
        <GestureDetector gesture={drag}>
          <Animated.View
            entering={SlideInDown.duration(SLIDE_MS).easing(
              Easing.out(Easing.cubic),
            )}
            exiting={SlideOutDown.duration(SLIDE_MS).easing(
              Easing.in(Easing.cubic),
            )}
            onLayout={onBoxLayout}
            style={[{ bottom: bottomOffset }, dragStyle]}
            className="absolute inset-x-0"
            testID="floating-call"
          >
            <OngoingCall {...call} className="shadow-lg" />
          </Animated.View>
        </GestureDetector>
      ) : null}
    </View>
  );
}
