import { Button, Text } from "@shared/components/atoms";
import Input from "@shared/components/inputs/Input";
import SafeArea from "@shared/components/safearea/SafeArea";
import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";

import { DeviceCheckCard, Header } from "../components";

export default function DeviceCheckScreen() {
  const router = useRouter();
  return (
    <SafeArea>
      <Header />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="mt-10.25 mb-4 font-overline text-overline text-text-brand">
          BEFORE YOU ENTER
        </Text>
        <Text className="mb-4 font-h6 text-h6 text-text-primary">
          Choose how you want to arrive
        </Text>
        <Text className="mb-6 font-body-sm text-body-sm text-text-secondary">
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
          label="Save and Continue"
          onPress={() => router.push("/Meetings")}
        />
      </View>
    </SafeArea>
  );
}
