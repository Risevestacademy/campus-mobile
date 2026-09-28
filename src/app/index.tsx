import { Avatar, Button, Divider, Pill, Text } from "@shared/components/atoms";
import { ScrollView, View } from "react-native";

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
      <Divider />
      <ScrollView horizontal>
        <Pill label="Label" color="neutral" variant="solid" size="sm" />
        <Pill label="Label" color="neutral" variant="solid" size="lg" />
        <Pill label="Label" color="neutral" variant="subtle" size="sm" />
        <Pill label="Label" color="neutral" variant="subtle" size="lg" />
        <Pill label="Label" color="brand" variant="solid" size="sm" />
        <Pill label="Label" color="brand" variant="solid" size="lg" />
        <Pill label="Label" color="brand" variant="subtle" size="sm" />
        <Pill label="Label" color="brand" variant="subtle" size="lg" />
        <Pill label="Label" color="success" variant="solid" size="sm" />
        <Pill label="Label" color="success" variant="solid" size="lg" />
        <Pill label="Label" color="success" variant="subtle" size="sm" />
        <Pill label="Label" color="success" variant="subtle" size="lg" />
        <Pill label="Label" color="warning" variant="solid" size="sm" />
        <Pill label="Label" color="warning" variant="solid" size="lg" />
        <Pill label="Label" color="warning" variant="subtle" size="sm" />
        <Pill label="Label" color="warning" variant="subtle" size="lg" />
        <Pill label="Label" color="error" variant="solid" size="sm" />
        <Pill label="Label" color="error" variant="solid" size="lg" />
        <Pill label="Label" color="error" variant="subtle" size="sm" />
        <Pill label="Label" color="error" variant="subtle" size="lg" />
        <Pill label="Label" color="info" variant="solid" size="sm" />
        <Pill label="Label" color="info" variant="solid" size="lg" />
        <Pill label="Label" color="info" variant="subtle" size="sm" />
        <Pill label="Label" color="info" variant="subtle" size="lg" />
      </ScrollView>
    </View>
  );
}
