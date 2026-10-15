import { Text } from "@shared/components/atoms";
import { Clock } from "lucide-react-native";
import { View } from "react-native";

export function ExpiredFooter({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <View className="mt-3 flex-row items-center justify-center gap-2">
      <Clock width={14} height={14} color="#6C8793" />
      <Text variant="caption" className="text-text-secondary">
        {count} expired {count === 1 ? "notice" : "notices"} hidden
      </Text>
    </View>
  );
}
