import { Text } from "@shared/components/atoms";
import { Clock, FileText } from "lucide-react-native";
import { View } from "react-native";
import { withUniwind } from "uniwind";

const StyledFileText = withUniwind(FileText);
const StyledClock = withUniwind(Clock);

export function RoomChips({ people }: { people: number }) {
  return (
    <View className="flex-row gap-2">
      <View className="flex-row items-center gap-1 rounded-full bg-bg-raised-cool px-3 py-1">
        <StyledFileText colorClassName="accent-text-turquoise-soft" size={14} />
        <Text variant="label" className="text-text-turquoise-soft">
          People · {people}
        </Text>
      </View>
      <View className="flex-row items-center gap-1 rounded-full bg-bg-tint-turquoise px-3 py-1">
        <StyledClock colorClassName="accent-text-turquoise-soft" size={14} />
        <Text variant="label" className="text-text-turquoise-soft">
          Resources
        </Text>
      </View>
    </View>
  );
}
