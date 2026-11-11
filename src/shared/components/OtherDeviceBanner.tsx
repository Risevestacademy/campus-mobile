import { Text } from "@shared/components/atoms";
import { useTopInsetHandoff } from "@shared/hooks/useTopInsetHandoff";
import { useWs } from "@shared/hooks/useWs";
import { useIsWatching, useStandingEmpty } from "@store/world";
import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import {
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

/**
 * A red bar across the top of every screen while another device stands for
 * you on campus. "Enter here" takes the avatar back to this device. The
 * screens below are pushed down and lose their top inset, which the bar
 * takes over.
 */
export function OtherDeviceBanner({ children }: { children: ReactNode }) {
  const { status, reconnect } = useWs();
  // Watching, or replaced on a server that couldn't let us stay to watch.
  const elsewhere = useIsWatching() || status === "replaced";
  // The other device has gone; this one tries to stand in on its own.
  const left = useStandingEmpty();
  const insets = useSafeAreaInsets();
  useTopInsetHandoff(elsewhere);

  return (
    <View className="flex-1">
      {elsewhere ? (
        <View
          accessibilityRole="alert"
          className="flex-row items-center gap-3 bg-status-danger px-4 pb-2.5"
          style={{ paddingTop: insets.top + 10 }}
          testID="other-device-banner"
        >
          <StatusBar style="light" />
          <Text variant="body-sm" className="flex-1 text-text-on-dark">
            {left
              ? "Your other device left campus."
              : "You’re on campus on another device."}
          </Text>
          <Pressable
            onPress={() => reconnect()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityHint="Moves you onto campus on this device"
          >
            <Text variant="label" className="text-text-on-dark underline">
              Enter here
            </Text>
          </Pressable>
        </View>
      ) : null}
      <SafeAreaInsetsContext.Provider
        value={elsewhere ? { ...insets, top: 0 } : insets}
      >
        {children}
      </SafeAreaInsetsContext.Provider>
    </View>
  );
}
