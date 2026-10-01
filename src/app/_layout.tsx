import "../global.css";

import { queryClient } from "@shared/lib/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { GoogleOneTapSignIn } from "react-native-nitro-google-signin";
import { SafeAreaProvider } from "react-native-safe-area-context";

GoogleOneTapSignIn.configure({
  offlineAccess: true,
  webClientId:
    "416818957033-q52qcbpcl51vmuq21j1lv6jode6f4e56.apps.googleusercontent.com",
  // "416818957033-ut9j75dqa3p6hphkk9on2bf198382u81.apps.googleusercontent.com",
  // "416818957033-1i2t7aeepv8k1tcfkkt3v7db7qis33pn.apps.googleusercontent.com",
  iosClientId:
    "416818957033-okf2o1q2975tmf0f7i8mae30tab2k1k8.apps.googleusercontent.com",
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider style={{ flex: 1 }}>
        <KeyboardProvider>
          <StatusBar style={"dark"} />
          <Stack screenOptions={{ headerShown: false }} />
        </KeyboardProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
