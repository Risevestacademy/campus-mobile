import { Text } from "@shared/components/atoms";
import { Linking, View } from "react-native";

import type { CalendarEvent } from "../types";
import { EventCard } from "./EventCard";

type EventListProps = {
  events: CalendarEvent[];
};

export function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return (
      <Text variant="body-md" color="muted" className="py-6 text-center">
        Nothing scheduled
      </Text>
    );
  }

  const join = (event: CalendarEvent) => {
    if (event.meetingUrl) void Linking.openURL(event.meetingUrl);
  };

  return (
    <View className="gap-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} onJoin={join} />
      ))}
    </View>
  );
}
