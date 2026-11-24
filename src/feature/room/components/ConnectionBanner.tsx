import { useConnectionState } from "@livekit/react-native";
import { Text } from "@shared/components/atoms";
import { ConnectionState } from "livekit-client";
import { View } from "react-native";

const MESSAGES: Partial<Record<ConnectionState, string>> = {
  [ConnectionState.Connecting]: "Connecting…",
  [ConnectionState.Reconnecting]: "Reconnecting…",
  [ConnectionState.SignalReconnecting]: "Reconnecting…",
  [ConnectionState.Disconnected]: "Disconnected",
};

export function ConnectionBanner() {
  const message = MESSAGES[useConnectionState()];
  if (!message) return null;

  return (
    <View className="items-center rounded-full bg-bg-card px-3 py-1.5">
      <Text variant="caption" color="secondary">
        {message}
      </Text>
    </View>
  );
}
