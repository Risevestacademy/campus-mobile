import { EntryRequestWatcher } from "@features/campus";
import { OtherDeviceBanner } from "@shared/components";
import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <OtherDeviceBanner>
      <Stack screenOptions={{ headerShown: false }} />
      {/* A request to enter a locked space is answered wherever you are. */}
      <EntryRequestWatcher />
    </OtherDeviceBanner>
  );
}
