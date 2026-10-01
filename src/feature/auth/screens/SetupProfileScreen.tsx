import { Button, Text } from "@shared/components/atoms";
import SafeArea from "@shared/components/safearea/SafeArea";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { Header, ProfileCard } from "../components";

export default function SetupProfileScreen() {
  const router = useRouter();
  const [bio, setBio] = useState(
    "Learning product design and building with my cohort.",
  );

  return (
    <SafeArea>
      <Header />

      <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
        <Text className="mt-10.5 mb-2 font-h6 text-h6 text-text-secondary">
          YOUR CAMPUS IDENTITY
        </Text>
        <Text className="mb-2 font-h5 text-h5 text-text-primary">
          Set up your profile
        </Text>
        <Text className="mb-6 font-body-sm text-body-sm text-text-secondary">
          Changes appear in the preview before you continue.
        </Text>

        <ProfileCard bio={bio} onBioChange={setBio} />
      </KeyboardAwareScrollView>

      <View className="py-2">
        <Button
          label="Save and Continue"
          onPress={() => router.push("/(auth)/DeviceCheck")}
        />
      </View>
    </SafeArea>
  );
}
