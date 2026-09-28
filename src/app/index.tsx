import { Avatar, Button, Text } from "@shared/components/atoms";
import { View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-bg-canvas">
      <Text variant="display">Rise Campus</Text>
      <Avatar />
      <Avatar imageUrl="https://picsum.photos/200" />
      <Avatar placeholder="AO" />
      <Button variant="primary">
        <Text>Primary Button</Text>
      </Button>
      <Button variant="secondary">
        <Text>Secondary Button</Text>
      </Button>
      <Button variant="tertiary">
        <Text>Tertiary Button</Text>
      </Button>
    </View>
  );
}
