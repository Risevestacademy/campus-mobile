import { Text } from "@shared/components/atoms";
import { View } from "react-native";

import { useDayEvents } from "../hooks";
import { EventCard } from "./EventCard";

type EventListProps = {
  selectedKey: string;
};

export function EventList({ selectedKey }: EventListProps) {
  const events = useDayEvents(selectedKey);

  if (events.length === 0) {
    return (
      <Text variant="body-md" color="muted" className="py-6 text-center">
        Nothing scheduled
      </Text>
    );
  }

  return (
    <View className="gap-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </View>
  );
}
