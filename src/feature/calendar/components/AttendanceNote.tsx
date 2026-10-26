import { Text } from "@shared/components/atoms";
import { View } from "react-native";

type AttendanceNoteProps = {
  message: string;
};

export function AttendanceNote({ message }: AttendanceNoteProps) {
  return (
    <View className="gap-1 rounded-xl border border-dashed border-border-strong bg-bg-raised-cool p-4">
      <Text variant="overline" color="secondary" className="tracking-[1px]">
        Attendance · this week
      </Text>
      <Text variant="caption" color="secondary">
        {message}
      </Text>
    </View>
  );
}
