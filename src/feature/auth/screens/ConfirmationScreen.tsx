import SafeArea from "@shared/components/safearea/SafeArea";
import { useTimeout } from "@shared/hooks/useTimeout";
import { Check } from "@shared/icons";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Header } from "../components";

export default function ConfirmationScreen() {
  const router = useRouter();

  useTimeout(() => router.push("/(auth)/SignIn"), 1000);

  return (
    <SafeArea>
      <Header />

      <View className="flex-1 items-center justify-center">
        <View className="mb-12.75 size-22 items-center justify-center rounded-full bg-action-secondary-default">
          <Check />
        </View>

        <Text className="mb-4 font-h1 text-h1 text-text-primary">
          You’re in
        </Text>

        <Text className="mb-14 font-body-md text-label text-text-secondary">
          Taking you to Campus…
        </Text>
      </View>
    </SafeArea>
  );
}
