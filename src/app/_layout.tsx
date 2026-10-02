import "../global.css";

import config from "@core/config";
import { queryClient } from "@shared/lib/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { GoogleOneTapSignIn } from "react-native-nitro-google-signin";
import { SafeAreaProvider } from "react-native-safe-area-context";

GoogleOneTapSignIn.configure({
  webClientId: config.googleWebClientId,
  iosClientId: config.googleIosClientId,
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
