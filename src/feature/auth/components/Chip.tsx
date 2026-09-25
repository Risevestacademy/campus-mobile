import { Text, View } from "react-native";

interface ChipProps {
  title: string;
}

export default function Chip({ title }: ChipProps) {
  return (
    <View className="min-h-8 w-40.75 items-center justify-center rounded-full border border-border-default px-3">
      <Text className="text-center font-label text-label text-text-primary">
        {title}
      </Text>
    </View>
  );
}
