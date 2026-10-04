import { ApiError, isApiError } from "@core/api/error";
import { Button, Modal, Text, toast } from "@shared/components/atoms";
import SafeArea from "@shared/components/safearea/SafeArea";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { Header, InvitationDetailsCard } from "../components";
import { useInviteDecision, useInviteValidate } from "../hooks";

export default function CreatePasswordScreen() {
  const router = useRouter();
  const { decideOnInvite, isLoading: isLoadingInvite } = useInviteDecision();
  const { data: inviteData, isLoading } = useInviteValidate();

  const [linkExpiredVisible, setLinkExpiredVisible] = useState(false);

  const acceptInvite = async () => {
    try {
      // console.log(inviteData);
      await decideOnInvite({
        decision: "accept",
        token: inviteData?.id!,
      });
      router.replace("/SetupProfile");
    } catch (error) {
      if (isApiError(error)) {
        const e = error as ApiError;

        switch (e.code) {
          case "INVITE_ALREADY_ACCEPTED":
            router.replace("/(auth)/InvalidInvitation");
            return;
          case "INVITE_ALREADY_DECLINED":
            setLinkExpiredVisible(true);
            return;
          default:
            toast.error(e.message || "Failed to accept invite");
        }
      } else {
        toast.error("Failed to accept invite");
      }
    }
  };

  const email = inviteData?.user.email ?? "";
  const name = inviteData?.user.displayName ?? "";
  const role = inviteData?.cohortRole ?? "";
  const cohortDate = inviteData?.cohort?.startDate
    ? new Date(inviteData?.cohort?.startDate)
    : null;
  const cohort = cohortDate
    ? `${inviteData?.track?.name} ${cohortDate.getUTCFullYear()}`
    : "";

  return (
    <SafeArea>
      <Header />
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <>
          <View className="mt-12.25 flex-1">
            <Text className="mb-1" color="primary" variant="h5">
              Are your details correct?
            </Text>
            <Text className="mb-7.25" color="secondary" variant="body-md">
              Check your details
            </Text>

            <InvitationDetailsCard
              email={email}
              role={role}
              cohort={cohort}
              name={name}
            />

            <Text color="muted" variant="caption">
              Set by the campus admin - not editable here.
            </Text>
          </View>

          <View className="gap-4 py-2">
            <Button
              label="Continue"
              onPress={acceptInvite}
              loading={isLoadingInvite}
            />
            {/* Disable button for now */}
            <Button
              label="Flag an issue"
              variant="secondary"
              disabled={isLoadingInvite}
              className="border-bg-band"
              labelClassName="text-text-brand"
              // onPress={() => setLinkExpiredVisible(true)}
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
        </>
      )}
    </SafeArea>
  );
}
