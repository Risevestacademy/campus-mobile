import { Text } from "@shared/components/atoms";
import { cn } from "@shared/utils/style";
import { cva } from "class-variance-authority";
import { View } from "react-native";

import type { CalendarEventKind } from "../types";

const timeBlockVariants = cva("items-center rounded-lg py-2 px-3", {
  variants: {
    kind: {
      class: "bg-bg-raised-cool",
      mentor: "bg-bg-tint-violet",
      broadcast: "bg-bg-tint-coral",
    },
  },
});

const timeTextVariants = cva("", {
  variants: {
    kind: {
      class: "text-text-sky",
      mentor: "text-text-violet",
      broadcast: "text-text-coral-strong",
    },
  },
});

type TimeBlockProps = {
  start: string;
  end: string;
  kind: CalendarEventKind;
};

export function TimeBlock({ start, end, kind }: TimeBlockProps) {
  return (
    <View className={cn(timeBlockVariants({ kind }))}>
      <Text variant="label" className={timeTextVariants({ kind })}>
        {start}
      </Text>
      <Text variant="caption" className={timeTextVariants({ kind })}>
        {end}
      </Text>
    </View>
  );
}
