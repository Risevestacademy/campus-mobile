import Button from "@shared/components/buttons/Button";
import Input from "@shared/components/inputs/Input";
import SafeArea from "@shared/components/safearea/SafeArea";
import { useRouter } from "expo-router";
import { Image, ScrollView, Text, View } from "react-native";

import { Header } from "../components";

function SignInScreen() {
  const router = useRouter();
  return (
    <SafeArea>
      <Header />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="mb-3.5 font-overline text-overline text-text-brand">
          WELCOME BACK
        </Text>
        <Text className="mb-11.5 font-h1 text-h1 text-text-primary">
          Sign in
        </Text>

        <View className="mb-17 flex gap-9">
          <Input label="Display name" placeholder="Joseph" variant="text" />
          <Input label="Password" placeholder="Enter your password" />
          <Text className="-mt-4 font-body-sm text-body-sm text-text-link">
            Forgot password
          </Text>
        </View>

        <View className="mb-4">
          <Image
            source={require("@assets/images/brand-illustration.png")}
            className="h-33 w-full"
            // resizeMode="contain"
          />
        </View>

        <Text className="font-body-md text-label text-text-secondary">
          Your cohort is waiting.
        </Text>
      </ScrollView>

      <View className="py-2">
        <Button
          title="Sign in"
          onPress={() => router.push("/(auth)/InvalidInvitation")}
        />
      </View>
    </SafeArea>
  );
}

export default SignInScreen;
