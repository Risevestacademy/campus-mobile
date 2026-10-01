import { Button, StatusDot, Text } from "@shared/components/atoms";
import SafeArea from "@shared/components/safearea/SafeArea";
import { VerifiedCheck } from "@shared/icons";
import { useRouter } from "expo-router";
import { View } from "react-native";

export default function AccountVerifiedScreen() {
  const router = useRouter();

  return (
    <SafeArea>
      <View className="mt-40 flex-1 items-center">
        <View
          className="rounded-full"
          style={{
            shadowColor: "#3155D6",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <VerifiedCheck />
        </View>

        <View className="mt-4 flex-row items-center gap-2">
          <StatusDot status="online" />
          <Text className="font-caption text-caption text-text-secondary">
            Connected successfully
          </Text>
        </View>

        <Text className="mt-6 text-center font-h2 text-h2 text-text-primary">
          Welcome to Campus!
        </Text>
        <Text className="mt-3 text-center font-body-md text-body-md text-text-secondary">
          Your account has been verified.{"\n"}Your learning journey starts now.
        </Text>
      </View>

      <View className="gap-4 py-2">
        <Button
          label="Go to Campus"
          onPress={() => router.push("/(auth)/SignIn")}
        />
        <Button
          label="View your profile"
          variant="secondary"
          className="border-border-focus"
          labelClassName="text-text-brand"
          onPress={() => router.push("/(auth)/SetupProfile")}
        />
      </View>
    </SafeArea>
  );
}
