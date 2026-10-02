import { ApiError, isApiError } from "@core/api/error";
import { Button, Text } from "@shared/components/atoms";
import SafeArea from "@shared/components/safearea/SafeArea";
import { Google } from "@shared/icons";
import { useInviteStore } from "@store/invite";
import { useRouter } from "expo-router";
import { Image, View } from "react-native";
import {
  GoogleOneTapSignIn,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
} from "react-native-nitro-google-signin";

import { Header } from "../components";
import { useInvitePreview, useSignInWithGoogle } from "../hooks";

function SignInScreen() {
  const router = useRouter();
  const { signInWithGoogle } = useSignInWithGoogle();
  const { previewInvite } = useInvitePreview();
  const { setInvite } = useInviteStore();

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
        // Send idToken to your backend for verification
        const signInResp = await signInWithGoogle(idToken);
        // Check if invite is stil active
        const _inviteResp = await previewInvite(signInResp?.inviteId!);
        if (_inviteResp) {
          setInvite({
            inviteId: signInResp?.inviteId!,
            inviteDetails: _inviteResp,
          });
        }
        // Navigate to invite screen if invite is stil active
        router.push("/invitation");
      }
    } catch (error) {
      if (isApiError(error)) {
        const e = error as ApiError;
        // If code is invite accepted, log the user in
        if (e.code === "INVITE_ALREADY_ACCEPTED") {
          router.replace("/AccountVerified");
          return;
        } else if (e.code === "INVITE_ALREADY_DECLINED") {
          router.replace("/InvalidInvitation");
          return;
        }
        // TODO: We should also handle for delined @jesse
        // Navigate to error screen
        console.error(error);
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

      <View className="">
        <Text className="mt-12 mb-6 text-center" variant="h3" color="primary">
          Sign in
        </Text>

        <Button
          variant="secondary"
          className="gap-2 border-border-strong"
          onPress={signIn}
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
