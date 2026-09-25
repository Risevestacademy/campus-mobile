import Button from "@shared/components/buttons/Button";
import SafeArea from "@shared/components/safearea/SafeArea";
import { useRouter } from "expo-router";
import { Image, ScrollView, Text, View } from "react-native";

import { Chip, Header } from "../components";

export default function InvitationScreen() {
  const router = useRouter();
  return (
    <SafeArea>
      <Header />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mb-7">
          <Image
            source={require("@assets/images/brand-illustration.png")}
            className="h-33 w-full"
          />
        </View>

        <Text className="mb-3.5 font-overline text-overline text-text-brand">
          CAMPUS INVITATION
        </Text>
        <Text className="mb-5 font-h1 text-h1 text-text-primary">
          You’re invited to join Product Design Cohort 2026
        </Text>

        <Text className="mb-14.5 font-body-md text-label text-text-secondary">
          Campus by Rise brings your cohort classes, mentor sessions and
          resources into one shared space. This invitation gives you a Student
          seat. Set up your account next.
        </Text>

        <View className="flex flex-row flex-wrap gap-3">
          <Chip title="Invited by Jerry" />
          <Chip title="Role · Student" />
          <Chip title="Cohort · Product Design 2026" />
        </View>
      </ScrollView>

      <View className="py-2">
        <Button
          title="Continue"
          onPress={() => router.push("/(auth)/CreatePassword")}
        />
      </View>
    </SafeArea>
  );
}
