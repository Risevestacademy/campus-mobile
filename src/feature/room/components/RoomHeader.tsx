import { LiveIndicator } from "@shared/components";
import { Text } from "@shared/components/atoms";
import { View } from "react-native";

/** Blue band: where you are and how many are in. No back arrow; leave via the exit control. */
export function RoomHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View className="bg-bg-band px-4 pt-2 pb-4">
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1 gap-0.5">
          <Text variant="h4" className="text-action-accent">
            {title}
          </Text>
          <Text variant="caption" className="text-text-rail">
            {subtitle}
          </Text>
        </View>
        <LiveIndicator />
      </View>
    </View>
  );
}
