import { ApiError, isApiError } from "@core/api/error";
import { Button, toast } from "@shared/components/atoms";
import { Text } from "@shared/components/atoms/Text";
import SafeArea from "@shared/components/safearea/SafeArea";
import { Google } from "@shared/icons";
import { useInviteStore } from "@store/invite";
import { useSessionStore } from "@store/session";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Image, ScrollView, View } from "react-native";
import {
  GoogleOneTapSignIn,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
} from "react-native-nitro-google-signin";

import { Chip, Header } from "../components";
import { useInvitePreview, useSignInWithGoogle } from "../hooks";

export default function InvitationScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { inviteDetails, setInvite } = useInviteStore();
  const { previewInvite, isLoading } = useInvitePreview();
  const { signInWithGoogle, isLoading: isLoadingGoogle } =
    useSignInWithGoogle();
  const router = useRouter();

  const signIn = async () => {
    try {
      await GoogleOneTapSignIn.checkPlayServices();

      let response = await GoogleOneTapSignIn.createAccount();

      if (isNoSavedCredentialFoundResponse(response)) {
        response = await GoogleOneTapSignIn.presentExplicitSignIn();
      }

      if (isSuccessResponse(response)) {
        const { idToken } = response.data;
        // Send idToken to your backend for verification
        await signInWithGoogle(idToken);
        // decide immediately upon sign in
        router.replace("/(auth)/CreatePassword");
      }
    } catch (error) {
      if (isApiError(error)) {
        const e = error as ApiError;
        console.error(e);
        // If code is invite accepted, log the user in
        if (e.code === "INVITE_ALREADY_ACCEPTED") {
          await useSessionStore.getState().clearHasInvite();
          router.replace("/(tabs)/(campus)");
          return;
        } else if (e.code === "INVITE_ALREADY_DECLINED") {
          router.replace("/InvalidInvitation");
          return;
        }
        // TODO: We should also handle for delined @jesse
        // Navigate to error screen
        toast.error(e.message || "Sign in failed");
      }
    }
  };

  React.useEffect(() => {
    if (!token) return;
    const preview = async () => {
      return previewInvite(token);
    };

    preview()
      .then((d) => {
        setInvite({ inviteDetails: d, inviteId: token });
      })
      .catch(() => {
        router.replace("/InvalidInvitation");
      });
  }, [token, previewInvite, router, setInvite]);

  const cohortYear = inviteDetails?.cohort?.startDate
    ? new Date(inviteDetails?.cohort?.startDate).getUTCFullYear()
    : null;
  return (
    <SafeArea>
      <Header />
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <View className="flex-1">
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ marginTop: 24 }}
          >
            <View className="mb-8.5 h-33">
              <Image
                source={require("@assets/images/brand-illustration.png")}
                className="h-full w-full"
              />
            </View>

            <Text variant="h5" className="mb-2" color="muted">
              CAMPUS INVITATION
            </Text>
            <Text variant="h5" className="mb-4 font-h5 text-h5" color="primary">
              You&apos;re invited to join {inviteDetails?.track?.name}{" "}
              {cohortYear}
            </Text>

            <Text variant="body-sm" className="mb-8.5" color="muted">
              Campus by Rise is a shared virtual space for your cohort classes,
              mentor sessions and resources all live in one place. This
              invitation gives you a Student seat in this cohort; you’ll set up
              your account on the next step.
            </Text>

            <View className="flex flex-row flex-wrap gap-3">
              <Chip
                title={`Invited by ${inviteDetails?.invitedBy.firstName}`}
              />
              <Chip title={`Role · ${inviteDetails?.cohortRole}`} />
              <Chip
                title={`${inviteDetails?.cohort?.name} · ${inviteDetails?.track?.name} ${cohortYear}`}
              />
            </View>
          </ScrollView>

          <View className="py-2">
            <Button
              className="gap-2 border-border-strong"
              onPress={signIn}
              loading={isLoadingGoogle}
            >
              <Google />
              <Text variant="label" className="text-text-on-dark">
                Continue with Google
              </Text>
            </Button>
          </View>
        </View>
      )}
    </SafeArea>
  );
}
