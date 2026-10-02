import { Button } from "@shared/components/atoms";
import { Text } from "@shared/components/atoms/Text";
import SafeArea from "@shared/components/safearea/SafeArea";
import { useInviteStore } from "@store/invite";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Image, ScrollView, View } from "react-native";

import { Chip, Header } from "../components";
import { useInvitePreview } from "../hooks";

export default function InvitationScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { inviteDetails, setInvite } = useInviteStore();
  const { previewInvite, isLoading } = useInvitePreview();
  const router = useRouter();

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
      {token && isLoading ? (
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
              label="Continue"
              onPress={() =>
                router.push(
                  `/(auth)/CreatePassword?isDeepLinked=${token !== null}`,
                )
              }
            />
          </View>
        </View>
      )}
    </SafeArea>
  );
}
