import { Tabs } from "expo-router";
import { PlatformPressable } from "expo-router/build/react-navigation";
import {
  BellRingingIcon,
  CalendarCheckIcon,
  ChatCircleIcon,
  type Icon,
  MapTrifoldIcon,
  UserIcon,
} from "phosphor-react-native";
import { ColorValue, View } from "react-native";
import { useCSSVariable, useResolveClassNames } from "uniwind";

function tabIcon(IconComponent: Icon) {
  const icon = ({
    color,
    focused,
  }: {
    color: ColorValue;
    focused: boolean;
  }) => (
    <View
      className={`mb-1 rounded-full px-4 py-0.5 ${focused ? "bg-bg-hover" : ""}`}
    >
      <IconComponent color={color as string} size={22} />
    </View>
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
        options={{ title: "Campus", tabBarIcon: tabIcon(MapTrifoldIcon) }}
      />
      <Tabs.Screen
        name="(messages)"
        options={{ title: "Chat", tabBarIcon: tabIcon(ChatCircleIcon) }}
      />
      <Tabs.Screen
        name="(calendar)"
        options={{ title: "Schedule", tabBarIcon: tabIcon(CalendarCheckIcon) }}
      />
      <Tabs.Screen
        name="(notifications)"
        options={{ title: "Notices", tabBarIcon: tabIcon(BellRingingIcon) }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{ title: "Me", tabBarIcon: tabIcon(UserIcon) }}
      />
    </Tabs>
  );
}
