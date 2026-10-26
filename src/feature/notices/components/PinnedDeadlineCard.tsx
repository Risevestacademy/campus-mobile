import { Pill, Text } from "@shared/components/atoms";
import { View } from "react-native";

import { formatDaysLeft } from "../helpers";
import type { Notice } from "../types";

export function PinnedDeadlineCard({ notice }: { notice: Notice }) {
  return (
    <View className="gap-2 rounded-xl bg-bg-band-lemon p-4">
      <View className="flex-row items-center justify-between">
        <Text variant="overline" className="tracking-[1px] text-lemon-900">
          Pinned · Deadline
        </Text>
        {notice.dueAt ? (
          <Pill
            size="lg"
            label={formatDaysLeft(notice.dueAt)}
            className="bg-text-on-accent"
            labelClassName="text-action-accent"
          />
        ) : null}
      </View>
      <Text variant="h5" className="text-text-on-accent">
        {notice.title}
      </Text>
      <Text variant="caption" className="text-lemon-900">
        {notice.subtitle}
      </Text>
    </View>
  );
}
