import { ApiError, isApiError } from "@core/api/error";
import { Button, Text, toast } from "@shared/components/atoms";
import SafeArea from "@shared/components/safearea/SafeArea";
import { Google } from "@shared/icons";
import { useRouter } from "expo-router";
import { Image, View } from "react-native";
import {
  GoogleOneTapSignIn,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
} from "react-native-nitro-google-signin";

import { Header } from "../components";
import { useSignInWithGoogle } from "../hooks";

function SignInScreen() {
  const router = useRouter();
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
          router.replace("/(tabs)/(campus)");
          return;
        } else if (e.code === "INVITE_ALREADY_DECLINED") {
          router.replace("/InvalidInvitation");
          return;
        }
        // TODO: We should also handle for delined @jesse
        toast.error(e.message || "Sign in failed");
      }
    }
  };

  return (
    <SafeArea>
      <Header />

      <Image
        source={require("@assets/images/brand-illustration.png")}
        className="mt-3 h-33 w-full rounded-2xl"
      />

      <View className="mt-40 items-center justify-center">
        <Text className="mt-12 mb-6 text-3xl" variant="h3" color="primary">
          Sign in
        </Text>

        <Button
          variant="secondary"
          className="gap-2 border-border-strong"
          onPress={signIn}
          loading={isLoadingGoogle}
        >
          <Google />
          <Text className="font-label text-label text-text-primary">
            Continue with Google
          </Text>
        </Button>
      </View>
    </SafeArea>
  );
}

export default SignInScreen;
