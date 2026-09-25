import Button from "@shared/components/buttons/Button";
import Input from "@shared/components/inputs/Input";
import SafeArea from "@shared/components/safearea/SafeArea";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { Header, ProfileCard } from "../components";

export default function SetupProfileScreen() {
  const router = useRouter();
  return (
    <SafeArea>
      <Header />

      <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
        <Text className="mb-3.5 font-overline text-overline text-text-brand">
          YOUR CAMPUS IDENTITY
        </Text>
        <Text className="mb-2.5 font-h1 text-h1 text-text-primary">
          Set up your profile
        </Text>

        <Text className="mb-6 font-body-md text-label text-text-secondary">
          Changes appear in the preview as you fill this in.
        </Text>

        <ProfileCard />

        <View className="flex gap-3.5">
          <Input
            label="Display name"
            placeholder="Joseph Akintomide"
            variant="text"
          />
          <Input
            label="Role shown in this cohort"
            placeholder="Student"
            variant="text"
          />
          <Input
            label="Short bio"
            placeholder="Learning product design and building with my cohort."
            variant="text-area"
          />
        </View>
      </KeyboardAwareScrollView>

      <View className="py-2">
        <Button
          title="Save and continue"
          onPress={() => router.push("/(auth)/DeviceCheck")}
        />
      </View>
    </SafeArea>
  );
}
