import { BroadcastBanner } from "@features/room";
import { OtherDeviceBanner } from "@shared/components";
import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <OtherDeviceBanner>
      <Stack screenOptions={{ headerShown: false }} />
      {/* Over every screen while somebody broadcasts to the campus. */}
      <BroadcastBanner />
    </OtherDeviceBanner>
  );
}
