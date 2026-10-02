import "../global.css";

import { authEvents } from "@core/auth/authEvents";
import config from "@core/config";
import { queryClient } from "@shared/lib/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { GoogleOneTapSignIn } from "react-native-nitro-google-signin";
import { SafeAreaProvider } from "react-native-safe-area-context";

GoogleOneTapSignIn.configure({
  webClientId: config.googleWebClientId,
  iosClientId: config.googleIosClientId,
});

export default function RootLayout() {
  React.useEffect(() => {
    const unsubscribe = authEvents.onUnauthenticated(() => {
      queryClient.clear();
      router.replace("/(auth)/SignIn");
    });

    return () => {
      unsubscribe();
    };
  }, []);

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
