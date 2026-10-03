import "../global.css";

import config from "@core/config";
import { Toast } from "@shared/components/atoms";
import { queryClient } from "@shared/lib/react-query";
import { useSessionStore } from "@store/session";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { GoogleOneTapSignIn } from "react-native-nitro-google-signin";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useResolveClassNames } from "uniwind";

void SplashScreen.preventAutoHideAsync();

GoogleOneTapSignIn.configure({
  webClientId: config.googleWebClientId,
  iosClientId: config.googleIosClientId,
});

export default function RootLayout() {
  const status = useSessionStore((state) => state.status);
  const hydrate = useSessionStore((state) => state.hydrate);

  const contentStyle = useResolveClassNames("bg-bg-band");

  React.useEffect(() => {
    void hydrate();
  }, [hydrate]);

  React.useEffect(() => {
    if (status !== "loading") {
      void SplashScreen.hideAsync().catch(() => {});
    }
  }, [status]);

  if (status === "loading") {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider style={{ flex: 1 }}>
        <KeyboardProvider>
          <StatusBar style={"dark"} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle,
              animation: "fade",
            }}
          >
            <Stack.Protected guard={status === "authenticated"}>
              <Stack.Screen name="(tabs)" />
            </Stack.Protected>
            <Stack.Protected guard={status === "unauthenticated"}>
              <Stack.Screen name="(auth)" />
            </Stack.Protected>
          </Stack>
          <Toast />
        </KeyboardProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
