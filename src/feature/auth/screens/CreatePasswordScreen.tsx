import Button from "@shared/components/buttons/Button";
import Input from "@shared/components/inputs/Input";
import SafeArea from "@shared/components/safearea/SafeArea";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { Header, InvitationDetailsCard } from "../components";

export default function CreatePasswordScreen() {
  const router = useRouter();
  return (
    <SafeArea>
      <Header />

      <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
        <Text className="mb-3.5 font-overline text-overline text-text-brand">
          SET UP YOUR ACCOUNT
        </Text>
        <Text className="mb-8 font-h1 text-h1 text-text-primary">
          Create your password
        </Text>

        <InvitationDetailsCard />

        <Text className="mb-14 font-body-md text-label text-text-secondary">
          Set by your inviter. These details can’t be edited here.
        </Text>

        <View className="flex gap-7.5">
          <Input label="Password" placeholder="At least 8 characters" />
          <Input
            label="Confirm password"
            placeholder="Re-enter your password"
          />
        </View>
      </KeyboardAwareScrollView>

      <View className="py-2">
        <Button
          title="Create account"
          onPress={() => router.push("/(auth)/SetupProfile")}
        />
      </View>
    </SafeArea>
  );
}
