import { ApiError, isApiError } from "@core/api/error";
import { Button, Modal, Text } from "@shared/components/atoms";
import SafeArea from "@shared/components/safearea/SafeArea";
import { Google } from "@shared/icons";
import { InvitePreviewData, useInviteStore } from "@store/invite";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import {
  GoogleOneTapSignIn,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
} from "react-native-nitro-google-signin";

import { Header, InvitationDetailsCard } from "../components";
import { useInviteDecision, useSignInWithGoogle } from "../hooks";

export default function CreatePasswordScreen({
  isDeepLinked = false,
}: {
  isDeepLinked: boolean;
}) {
  const router = useRouter();
  const { inviteId, inviteDetails } = useInviteStore();
  const { decideOnInvite } = useInviteDecision();
  const { signInWithGoogle } = useSignInWithGoogle();

  const [linkExpiredVisible, setLinkExpiredVisible] = useState(false);

  const acceptInvite = async () => {
    if (!inviteId) {
      setLinkExpiredVisible(true);
      return;
    }

    try {
    } catch (error) {
      if (isApiError(error)) {
      }
      console.error(error);
      setLinkExpiredVisible(true);
    }
  };

  const email = (inviteDetails as InvitePreviewData).email ?? "";
  const role = inviteDetails?.cohortRole ?? "";
  const cohortDate = inviteDetails?.cohort?.startDate
    ? new Date(inviteDetails?.cohort?.startDate)
    : null;
  const cohort = cohortDate
    ? `${inviteDetails?.track?.name} ${cohortDate.getUTCFullYear()}`
    : "";

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
        // decide immediately upon sign in
        await decideOnInvite({
          decision: "accept",
          token: signInResp?.inviteId!,
        });
        router.replace("/(auth)/AccountVerified");
      }
    } catch (error) {
      if (isApiError(error)) {
        const e = error as ApiError;
        // If code is invite accepted, log the user in
        if (e.code === "INVITE_ALREADY_ACCEPTED") {
          router.replace("/AccountVerified");
          // TODO: Change this once screens are available
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

  // TODO: show this after Continue once real invite-expiry checks exist;
  // "Flag an issue" triggers it for now.
  return (
    <SafeArea>
      <Header />

      <View className="mt-12.25 flex-1">
        <Text className="mb-1" color="primary" variant="h5">
          Are your details correct?
        </Text>
        <Text className="mb-7.25" color="secondary" variant="body-md">
          Check your details
        </Text>

        <InvitationDetailsCard email={email} role={role} cohort={cohort} />

        <Text color="muted" variant="caption">
          Set by the campus admin - not editable here.
        </Text>
      </View>

      <View className="gap-4 py-2">
        {isDeepLinked ? (
          <Button className="gap-2 border-border-strong" onPress={signIn}>
            <Google />
            <Text className="font-label text-label text-text-primary">
              Continue with Google
            </Text>
          </Button>
        ) : (
          <Button label="Continue" onPress={acceptInvite} />
        )}
        {/* Disable button for now */}
        <Button
          label="Flag an issue"
          variant="secondary"
          disabled
          className="border-bg-band"
          labelClassName="text-text-brand"
          onPress={() => setLinkExpiredVisible(true)}
        />
      </View>

      <Modal
        visible={linkExpiredVisible}
        title="Invite link expired"
        description="This invitation link has expired or has already been used. Contact whoever gave you this link for a new one."
        actionLabel="Request another link"
        onAction={() => setLinkExpiredVisible(false)}
        onClose={() => setLinkExpiredVisible(false)}
      />
    </SafeArea>
  );
}
