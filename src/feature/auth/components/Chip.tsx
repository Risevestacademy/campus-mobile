import { Text } from "@shared/components/atoms/Text";
import { View } from "react-native";

interface ChipProps {
  title: string;
}

export default function Chip({ title }: ChipProps) {
  return (
    <View className="min-h-8 min-w-40.75 items-center justify-center rounded-full border border-border-default bg-bg-page px-3 py-2">
      <Text className="text-center font-label text-label font-medium text-[#14171A]">
        {title}
      </Text>
    </View>
  );
}
