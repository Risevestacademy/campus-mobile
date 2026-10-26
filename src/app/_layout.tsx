import "../global.css";

import { refreshSession, registerSessionExpirationHandler } from "@core/api";
import { getAuthTokens } from "@core/auth/tokenStorage";
import config from "@core/config";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Toast } from "@shared/components/atoms";
import { WebSocketProvider } from "@shared/components/providers/ws";
import { MeetingJoinProvider } from "@shared/hooks/ui/useMeetingJoin";
import { useMe } from "@shared/hooks/useMe";
import { queryClient } from "@shared/lib/react-query";
import { useSessionStore } from "@store/session";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { GoogleOneTapSignIn } from "react-native-nitro-google-signin";
import {
  SafeAreaListener,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import { Uniwind, useResolveClassNames } from "uniwind";

LogBox.ignoreLogs(["SafeAreaView has been deprecated"]);

GoogleOneTapSignIn.configure({
  webClientId: config.googleWebClientId,
  iosClientId: config.googleIosClientId,
});

registerSessionExpirationHandler((reason) => {
  void useSessionStore.getState().clearSession(reason);
});

const getAccessToken = async () => (await getAuthTokens())?.accessToken ?? null;

function WorldSocketProvider({ children }: { children: React.ReactNode }) {
  const status = useSessionStore((state) => state.status);
  const { data: me } = useMe({ enabled: status === "authenticated" });
  const cohortId = me?.membership?.cohortId ?? null;

  return (
    <WebSocketProvider
      url={config.worldUrl}
      cohortId={cohortId}
      origin={config.webOrigin}
      getAccessToken={getAccessToken}
      refreshSession={refreshSession}
    >
      {children}
    </WebSocketProvider>
  );
}

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
      <WorldSocketProvider>
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
                        <Stack.Screen name="(tabs)" />
                      </Stack.Protected>
                    </Stack>
                    <Toast />
                  </KeyboardProvider>
                </MeetingJoinProvider>
              </BottomSheetModalProvider>
            </GestureHandlerRootView>
          </SafeAreaListener>
        </SafeAreaProvider>
      </WorldSocketProvider>
    </QueryClientProvider>
  );
}
