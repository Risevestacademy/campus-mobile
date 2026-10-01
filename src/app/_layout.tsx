import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <KeyboardProvider>
        <StatusBar style={"dark"} />
        <Stack screenOptions={{ headerShown: false }} />
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
