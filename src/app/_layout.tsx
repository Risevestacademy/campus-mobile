import "../global.css";

import { registerSessionExpirationHandler } from "@core/api";
import { GOOGLE_SIGN_IN_CONFIG } from "@core/auth/googleSignIn";
import { RealtimeProvider } from "@core/realtime";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Toast } from "@shared/components/atoms";
import { MeetingJoinProvider } from "@shared/hooks/ui/useMeetingJoin";
import { queryClient } from "@shared/lib/react-query";
import { useAppearanceStore } from "@store/appearance";
import { useSessionStore } from "@store/session";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { GoogleOneTapSignIn } from "react-native-nitro-google-signin";
import {
  SafeAreaListener,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import { Uniwind, useResolveClassNames } from "uniwind";

GoogleOneTapSignIn.configure(GOOGLE_SIGN_IN_CONFIG);

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
    void useAppearanceStore.getState().hydrate();
  }, [hydrate]);

  const isReady = status !== "loading";
  const canAccessAuth =
    status === "loading" || status === "unauthenticated" || hasInvite;
  const canAccessApp = isReady && status === "authenticated" && !hasInvite;

  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeProvider>
        <SafeAreaProvider style={{ flex: 1 }}>
          <SafeAreaListener
            onChange={({ insets }) => {
              Uniwind.updateInsets(insets);
            }}
          >
            <GestureHandlerRootView>
              <BottomSheetModalProvider>
                <MeetingJoinProvider>
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
                        <Stack.Screen name="(app)" />
                      </Stack.Protected>
                    </Stack>
                    <Toast />
                  </KeyboardProvider>
                </MeetingJoinProvider>
              </BottomSheetModalProvider>
            </GestureHandlerRootView>
          </SafeAreaListener>
        </SafeAreaProvider>
      </RealtimeProvider>
    </QueryClientProvider>
  );
}
