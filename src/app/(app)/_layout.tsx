import { OtherDeviceBanner } from "@shared/components";
import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <OtherDeviceBanner>
      <Stack screenOptions={{ headerShown: false }} />
    </OtherDeviceBanner>
  );
}
