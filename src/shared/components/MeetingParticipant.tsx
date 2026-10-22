import { Text } from "@shared/components/atoms";
import { cn } from "@shared/utils/style";
import { View } from "react-native";

const PARTICIPANTS = [
  {
    letter: "C",
    className: "bg-amber-400",
    textClassName: "text-text-primary",
  },
  {
    letter: "R",
    className: "bg-coral-300",
    textClassName: "text-text-primary",
  },
  {
    letter: "V",
    className: "bg-violet-400",
    textClassName: "text-text-inverse",
  },
];

export function MeetingParticipants({ sideText }: { sideText: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <View className="flex-row">
        {PARTICIPANTS.map(({ letter, className, textClassName }, index) => (
          <View
            key={letter}
            className={cn(
              "size-6 items-center justify-center rounded-full border-2 border-bg-card dark:border-0",
              className,
              index > 0 && "-ml-2",
            )}
          >
            <Text className={cn("font-caption text-caption", textClassName)}>
              {letter}
            </Text>
          </View>
        ))}
      </View>
      <Text className="font-caption text-caption text-text-secondary">
        {sideText}
      </Text>
    </View>
  );
}
