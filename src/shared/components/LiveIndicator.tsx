import { View } from "react-native";

import { Text } from "./atoms";

export function LiveIndicator() {
  return (
    <View className="flex-row items-center gap-1 rounded-full bg-status-live px-2 py-0.5">
      <View className="size-1.5 rounded-full bg-text-on-dark" />
      <Text variant="overline" className="text-text-on-dark">
        LIVE
      </Text>
    </View>
  );
}
