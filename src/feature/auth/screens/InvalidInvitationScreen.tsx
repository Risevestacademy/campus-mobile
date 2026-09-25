import SafeArea from "@shared/components/safearea/SafeArea";
import { Cancel } from "@shared/icons";
import { Text, View } from "react-native";

import { Header } from "../components";

export default function InvalidInvitation() {
  return (
    <SafeArea>
      <Header />

      <View className="flex-1 items-center justify-center">
        <View className="mb-10.75 size-20 items-center justify-center rounded-full bg-status-error-bg-subtle">
          <Cancel />
        </View>

        <Text className="mb-7.5 text-center font-h1 text-h1 text-text-primary">
          This link isn’t valid anymore
        </Text>

        <Text className="mb-12 px-3 text-center font-body-md text-label text-text-secondary">
          This invitation link has expired or has already been used to set up an
          account. Links can only be used once.
        </Text>

        <View className="mx-auto mb-8.75 h-0.5 w-36 bg-border-default" />

        <Text className="px-4.5 text-center font-body-sm text-body-md text-text-primary">
          Contact whoever gave you this link for a new one.
        </Text>
      </View>
    </SafeArea>
  );
}
