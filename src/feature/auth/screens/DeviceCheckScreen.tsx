import Button from "@shared/components/buttons/Button";
import Input from "@shared/components/inputs/Input";
import SafeArea from "@shared/components/safearea/SafeArea";
import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { DeviceCheckCard, Header } from "../components";

export default function DeviceCheckScreen() {
  const router = useRouter();
  return (
    <SafeArea>
      <Header />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="mb-3.5 font-overline text-overline text-text-brand">
          BEFORE YOU ENTER
        </Text>
        <Text className="mb-3.5 font-h1 text-h1 text-text-primary">
          Choose how you want to arrive
        </Text>

        <Text className="mb-5.75 font-body-md text-label text-text-secondary">
          Camera stays off by default. Change these settings at any time.
        </Text>

        <DeviceCheckCard />

        <Input
          label="Availability on arrival"
          variant="select"
          options={["Available", "Not-Available"]}
        />
      </ScrollView>

      <View className="py-2">
        <Button
          title="Continue"
          onPress={() => router.push("/(auth)/Confirmation")}
        />
      </View>
    </SafeArea>
  );
}
