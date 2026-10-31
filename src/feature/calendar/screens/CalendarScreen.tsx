import { Button, Text } from "@shared/components/atoms";
import SafeArea from "@shared/components/safearea/SafeArea";
import { useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import {
  AttendanceNote,
  CalendarHeader,
  ConnectCalendarCard,
  EventList,
} from "../components";
import {
  eventDateKey,
  fromGoogleEvent,
  getEventsForDay,
  getWeekDays,
  getWeekRange,
  toDateKey,
} from "../helpers";
import { useCalendarEvents, useLiveEvents } from "../hooks";
import { MOCK_ATTENDANCE_NOTE } from "../mocks/calendar.mock";

function CalendarScreen() {
  const [selectedKey, setSelectedKey] = useState(toDateKey(new Date()));
  const days = useMemo(() => getWeekDays(), []);
  const range = useMemo(() => getWeekRange(days), [days]);
  const { data, isLoading, isError, refetch, isRefetching } =
    useCalendarEvents(range);

  const mapped = useMemo(
    () => (data?.connected ? data.events.map(fromGoogleEvent) : []),
    [data],
  );
  const events = useLiveEvents(mapped);
  const eventKeys = useMemo(() => new Set(events.map(eventDateKey)), [events]);

  const body = (() => {
    if (isLoading) {
      return <ActivityIndicator className="py-6" />;
    }
    if (isError || !data) {
      return (
        <View className="items-center gap-3 py-6">
          <Text variant="body-md" color="muted" className="text-center">
            Couldn&apos;t load your calendar.
          </Text>
          <Button
            variant="secondary"
            size="sm"
            label="Try again"
            loading={isRefetching}
            onPress={() => void refetch()}
          />
        </View>
      );
    }
    if (!data.connected) {
      return <ConnectCalendarCard />;
    }
    return <EventList events={getEventsForDay(events, selectedKey)} />;
  })();

  return (
    <SafeArea className="bg-bg-band p-0" disableBottomInset>
      <CalendarHeader
        days={days}
        eventKeys={eventKeys}
        synced={data?.connected === true}
        selectedKey={selectedKey}
        onSelect={setSelectedKey}
      />
      <ScrollView
        className="bg-bg-card"
        contentContainerClassName="gap-3 px-6 py-5 pb-8"
      >
        {body}
        <AttendanceNote message={MOCK_ATTENDANCE_NOTE} />
      </ScrollView>
    </SafeArea>
  );
}

export default CalendarScreen;
