import "../global.css";

import { registerSessionExpirationHandler } from "@core/api";
import config from "@core/config";
import { Toast } from "@shared/components/atoms";
import { queryClient } from "@shared/lib/react-query";
import { useSessionStore } from "@store/session";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { LogBox } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { GoogleOneTapSignIn } from "react-native-nitro-google-signin";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useResolveClassNames } from "uniwind";

LogBox.ignoreLogs(["SafeAreaView has been deprecated"]);

GoogleOneTapSignIn.configure({
  webClientId: config.googleWebClientId,
  iosClientId: config.googleIosClientId,
});

registerSessionExpirationHandler((reason) => {
  void useSessionStore.getState().clearSession(reason);
});

export default function RootLayout() {
  const contentStyle = useResolveClassNames("bg-bg-band");
  const status = useSessionStore((state) => state.status);
  const hasInvite = useSessionStore((state) => state.hasInvite);
  const hydrate = useSessionStore((state) => state.hydrate);

  React.useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const isReady = status !== "loading";
  const canAccessAuth =
    status === "loading" || status === "unauthenticated" || hasInvite;
  const canAccessApp = isReady && status === "authenticated" && !hasInvite;

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
            <Stack.Protected guard={canAccessAuth}>
              <Stack.Screen name="(auth)" />
            </Stack.Protected>
            <Stack.Protected guard={canAccessApp}>
              <Stack.Screen name="(tabs)" />
            </Stack.Protected>
          </Stack>
          <Toast />
        </KeyboardProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
