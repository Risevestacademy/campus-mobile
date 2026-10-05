import { Tabs } from "expo-router";
import {
  PlatformPressable,
  useNavigationState,
} from "expo-router/build/react-navigation";
import {
  CalendarCheck2,
  type LucideIcon,
  Map,
  MessageCircle,
  MessageCircleWarning,
  UserRound,
} from "lucide-react-native";
import React from "react";
import { ColorValue, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useCSSVariable, useResolveClassNames } from "uniwind";

function AnimatedTabIcon({
  IconComponent,
  color,
  routeName,
}: {
  IconComponent: LucideIcon;
  color: ColorValue;
  routeName: string;
}) {
  const pillBg = useCSSVariable("--color-bg-hover") as string;

  // Real focus state from the navigator, so it updates on every tab change
  const focused = useNavigationState(
    (state) => state.routes[state.index]?.name === routeName,
  );

  const pill = useSharedValue(focused ? 1 : 0);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    pill.value = withTiming(focused ? 1 : 0, { duration: 300 });

    if (focused) {
      scale.value = withSequence(
        withTiming(0.7, { duration: 90 }),
        withSpring(1, { damping: 5, stiffness: 220, mass: 0.6 }),
      );
    }
  }, [focused, pill, scale]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: pill.value,
    transform: [{ scaleX: 0.3 + 0.7 * pill.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View className="mb-1 items-center justify-center px-4 py-0.5">
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: pillBg, borderRadius: 999 },
          pillStyle,
        ]}
      />
      <Animated.View style={iconStyle}>
        <IconComponent color={color as string} size={22} />
      </Animated.View>
    </View>
  );
}

function tabIcon(IconComponent: LucideIcon, routeName: string) {
  const icon = ({ color }: { color: ColorValue }) => (
    <AnimatedTabIcon
      IconComponent={IconComponent}
      color={color}
      routeName={routeName}
    />
  );

  return icon;
}

export default function TabsLayout() {
  const activeFg = useCSSVariable("--color-text-link") as string;
  const inactiveFg = useCSSVariable("--color-text-muted") as string;
  const tabBarStyle = useResolveClassNames("bg-bg-card pt-2 h-20");
  const tabBarLabelStyle = useResolveClassNames("text-label");

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: activeFg,
        tabBarInactiveTintColor: inactiveFg,
        tabBarLabelStyle,
        tabBarButton: (props) => (
          <PlatformPressable
            {...props}
            android_ripple={{ color: "transparent" }}
            pressColor="transparent"
            pressOpacity={1}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="(campus)"
        options={{
          title: "Campus",
          tabBarIcon: tabIcon(Map, "(campus)"),
        }}
      />
      <Tabs.Screen
        name="(messages)"
        options={{
          title: "Chat",
          tabBarIcon: tabIcon(MessageCircle, "(messages)"),
        }}
      />
      <Tabs.Screen
        name="(calendar)"
        options={{
          title: "Schedule",
          tabBarIcon: tabIcon(CalendarCheck2, "(calendar)"),
        }}
      />
      <Tabs.Screen
        name="(notifications)"
        options={{
          title: "Notices",
          tabBarIcon: tabIcon(MessageCircleWarning, "(notifications)"),
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: "Me",
          tabBarIcon: tabIcon(UserRound, "(profile)"),
        }}
      />
    </Tabs>
  );
}
