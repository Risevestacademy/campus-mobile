import { ApiError, isApiError } from "@core/api/error";
import { Button, Text, toast } from "@shared/components/atoms";
import { Google } from "@shared/icons";
import { useSessionStore } from "@store/session";
import { Redirect, useRouter } from "expo-router";
import { ActivityIndicator, Image, View } from "react-native";
import {
  GoogleOneTapSignIn,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
} from "react-native-nitro-google-signin";
import { useUniwind } from "uniwind";

import { useSignInWithGoogle } from "../hooks";

const darkImage = require("@assets/images/splash-dark.png");
const lightImage = require("@assets/images/splash.png");

function SignInScreen() {
  const router = useRouter();
  const status = useSessionStore((state) => state.status);
  const hasInvite = useSessionStore((state) => state.hasInvite);

  const { theme } = useUniwind();

  const { signInWithGoogle, isLoading: isLoadingGoogle } =
    useSignInWithGoogle();

  const signIn = async () => {
    try {
      await GoogleOneTapSignIn.checkPlayServices();

      let response = await GoogleOneTapSignIn.signIn();

      if (isNoSavedCredentialFoundResponse(response)) {
        response = await GoogleOneTapSignIn.createAccount();
      }
      if (isNoSavedCredentialFoundResponse(response)) {
        response = await GoogleOneTapSignIn.presentExplicitSignIn();
      }

      if (isSuccessResponse(response)) {
        const { idToken } = response.data;
        const signInResp = await signInWithGoogle(idToken);
        if (signInResp?.inviteId) {
          router.push("/(auth)/CreatePassword");
          return;
        }

        router.replace("/(tabs)/(campus)");
      }
    } catch (error) {
      if (isApiError(error)) {
        const e = error as ApiError;
        // If code is invite accepted, log the user in
        if (e.code === "INVITE_ALREADY_ACCEPTED") {
          await useSessionStore.getState().clearHasInvite();
          router.replace("/(tabs)/(campus)");
          return;
        } else if (e.code === "INVITE_ALREADY_DECLINED") {
          router.replace("/InvalidInvitation");
          return;
        }
        toast.error(e.message || "Sign in failed");
      }
    }
  };

  if (status === "authenticated" && !hasInvite) {
    return <Redirect href="/(tabs)/(campus)" />;
  }

  return (
    <View className="relative flex-1">
      <Image
        source={theme === "dark" ? darkImage : lightImage}
        className="size-full"
      />

      <View className="absolute bottom-16 w-full justify-center p-6">
        {status === "unauthenticated" ||
        (status === "authenticated" && hasInvite) ? (
          <Button
            variant="secondary"
            className="bg-bg-card dark:border-0 dark:bg-action-primary"
            onPress={signIn}
            loading={isLoadingGoogle}
          >
            <Google />
            <Text className="font-label text-label text-text-primary">
              Continue with Google
            </Text>
          </Button>
        ) : (
          <ActivityIndicator />
        )}
      </View>
    </View>
  );
}

export default SignInScreen;
