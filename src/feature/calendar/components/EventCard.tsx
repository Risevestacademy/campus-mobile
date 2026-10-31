import { Button, Pill, Text } from "@shared/components/atoms";
import { Video } from "lucide-react-native";
import { View } from "react-native";

import { formatTime } from "../helpers";
import type { CalendarEvent } from "../types";
import { TimeBlock } from "./TimeBlock";

type EventCardProps = {
  event: CalendarEvent;
  onJoin?: (event: CalendarEvent) => void;
  onRemind?: (event: CalendarEvent) => void;
};

export function EventCard({ event, onJoin, onRemind }: EventCardProps) {
  const subtitle = [event.location, event.recurrence]
    .filter(Boolean)
    .join(" · ");

  return (
    <View className="flex-row items-center gap-3 rounded-xl border border-border-default bg-bg-card p-3">
      <TimeBlock
        start={event.allDay ? "All day" : formatTime(event.start)}
        end={event.allDay ? "" : formatTime(event.end)}
        kind={event.kind}
      />

      <View className="flex-1 items-start gap-1">
        {event.live ? (
          <Pill color="error" variant="solid" className="gap-1.5">
            <View className="size-1.5 rounded-full bg-bg-on-colour" />
            <Text variant="overline" className="text-text-on-dark">
              LIVE
            </Text>
          </Pill>
        ) : null}
        {event.kind === "broadcast" ? (
          <Pill
            label="LISTEN IN"
            className="bg-identity-coral-strong"
            labelClassName="text-text-on-dark"
          />
        ) : null}
        <Text variant="label" className="text-text-primary">
          {event.title}
        </Text>
        <Text variant="caption" className="text-text-secondary">
          {subtitle}
        </Text>
      </View>

      {event.live ? (
        // In person, or no link given: nothing to join from here.
        event.meetingUrl ? (
          <Button
            size="sm"
            className="h-8 rounded-full px-5"
            onPress={() => onJoin?.(event)}
          >
            <Video width={16} height={16} color="#F7F7F7" />
            <Text variant="label" className="text-text-on-dark">
              Join
            </Text>
          </Button>
        ) : null
      ) : (
        <Button
          variant="secondary"
          size="sm"
          label="Remind"
          className="h-8 rounded-full px-5"
          onPress={() => onRemind?.(event)}
        />
      )}
    </View>
  );
}
