import { Text } from "@shared/components/atoms";
import { View } from "react-native";

import { formatDayParts } from "../helpers";
import type { Notice } from "../types";

export function PinnedEventCard({ notice }: { notice: Notice }) {
  const date = notice.startsAt ? formatDayParts(notice.startsAt) : null;

  return (
    <View className="flex-row items-center gap-4 rounded-xl bg-bg-tint-coral p-4">
      {date ? (
        <View className="size-13 items-center justify-center rounded-xl bg-identity-coral-strong">
          <Text variant="overline" className="text-text-inverse">
            {date.weekday}
          </Text>
          <Text variant="h4" className="text-text-inverse">
            {date.day}
          </Text>
        </View>
      ) : null}
      <View className="flex-1 gap-0.5">
        <Text
          variant="overline"
          className="tracking-[1px] text-text-coral-strong"
        >
          Pinned · Event
        </Text>
        <Text variant="label" className="text-text-primary">
          {notice.title}
        </Text>
        <Text variant="caption" className="text-text-secondary">
          {notice.subtitle}
        </Text>
      </View>
    </View>
  );
}
