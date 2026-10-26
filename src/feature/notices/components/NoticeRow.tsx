import { Pill, Text } from "@shared/components/atoms";
import { cn } from "@shared/utils/style";
import { CalendarDays, Clock, FileText, Flag } from "lucide-react-native";
import { View } from "react-native";

import { formatTime } from "../helpers";
import type { Notice, NoticeKind } from "../types";

const ICON_SIZE = 18;

const ICONS: Record<
  NoticeKind,
  { Icon: typeof FileText; color: string; tile: string }
> = {
  resource: { Icon: FileText, color: "#238A80", tile: "bg-bg-raised-cool" },
  announcement: { Icon: Clock, color: "#D61A00", tile: "bg-bg-tint-coral" },
  deadline: { Icon: Flag, color: "#866804", tile: "bg-bg-tint-lemon" },
  event: { Icon: CalendarDays, color: "#D61A00", tile: "bg-bg-tint-coral" },
};

export function NoticeRow({ notice }: { notice: Notice }) {
  const { Icon, color, tile } = ICONS[notice.kind];

  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-border-default bg-bg-card p-3">
      <View
        className={cn("size-10.5 items-center justify-center rounded-lg", tile)}
      >
        <Icon width={ICON_SIZE} height={ICON_SIZE} color={color} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text variant="label" className="text-text-primary">
          {notice.title}
        </Text>
        <Text variant="caption" className="text-text-secondary">
          {notice.subtitle}
        </Text>
      </View>
      {notice.endsAt ? (
        <View>
          <Pill
            size="lg"
            color="error"
            label={`ENDS ${formatTime(notice.endsAt)}`}
            className="bg-bg-tint-coral"
            labelClassName="text-text-coral-strong"
          />
        </View>
      ) : null}
    </View>
  );
}
