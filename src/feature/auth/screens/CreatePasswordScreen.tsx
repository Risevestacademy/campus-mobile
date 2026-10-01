import { Button, Modal, Text } from "@shared/components/atoms";
import SafeArea from "@shared/components/safearea/SafeArea";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Header, InvitationDetailsCard } from "../components";

export default function CreatePasswordScreen() {
  const router = useRouter();
  // TODO: show this after Continue once real invite-expiry checks exist;
  // "Flag an issue" triggers it for now.
  const [linkExpiredVisible, setLinkExpiredVisible] = useState(false);
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

        <InvitationDetailsCard />

        <Text color="muted" variant="caption">
          Set by the campus admin — not editable here.
        </Text>
      </View>

      <View className="gap-4 py-2">
        <Button
          label="Continue"
          onPress={() => router.push("/(auth)/AccountVerified")}
        />
        <Button
          label="Flag an issue"
          variant="secondary"
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
