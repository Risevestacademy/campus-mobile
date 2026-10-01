import { Button } from "@shared/components/atoms";
import { Text } from "@shared/components/atoms/Text";
import SafeArea from "@shared/components/safearea/SafeArea";
import { useRouter } from "expo-router";
import { Image, ScrollView, View } from "react-native";

import { Chip, Header } from "../components";

export default function InvitationScreen() {
  const router = useRouter();
  return (
    <SafeArea>
      <Header />

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

        <Text variant={"h5"} className="mb-2 text-[#6B7280]">
          CAMPUS INVITATION
        </Text>
        <Text className="mb-4 font-h5 text-h5 text-[#14171A]">
          You’re invited to join Product Design Cohort 2026
        </Text>

        <Text className="mb-8.5 font-body-sm text-sm text-[#6B7280]">
          Campus by Rise is a shared virtual space for your cohort classes,
          mentor sessions and resources all live in one place. This invitation
          gives you a Student seat in this cohort; you’ll set up your account on
          the next step.
        </Text>

        <View className="flex flex-row flex-wrap gap-3">
          <Chip title="Invited by Jerry" />
          <Chip title="Role · Student" />
          <Chip title="Cohort · Product Design 2026" />
        </View>
      </ScrollView>

      <View className="py-2">
        <Button
          label="Continue"
          onPress={() => router.push("/(auth)/CreatePassword")}
        />
      </View>
    </SafeArea>
  );
}
