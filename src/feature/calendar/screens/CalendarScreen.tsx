import SafeArea from "@shared/components/safearea/SafeArea";
import { useState } from "react";
import { ScrollView } from "react-native";

import { AttendanceNote, CalendarHeader, EventList } from "../components";
import { toDateKey } from "../helpers";
import { MOCK_ATTENDANCE_NOTE } from "../mocks/calendar.mock";

function CalendarScreen() {
  const [selectedKey, setSelectedKey] = useState(toDateKey(new Date()));

  return (
    <SafeArea className="bg-bg-band p-0" disableBottomInset>
      <CalendarHeader selectedKey={selectedKey} onSelect={setSelectedKey} />
      <ScrollView
        className="bg-bg-card"
        contentContainerClassName="gap-3 px-6 py-5 pb-8"
      >
        <EventList selectedKey={selectedKey} />
        <AttendanceNote message={MOCK_ATTENDANCE_NOTE} />
      </ScrollView>
    </SafeArea>
  );
}

export default CalendarScreen;
