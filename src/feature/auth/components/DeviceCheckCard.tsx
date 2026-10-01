import { Button, Pill, Text } from "@shared/components/atoms";
import { Camera, Mic, Wifi } from "@shared/icons";
import { ReactNode } from "react";
import { View } from "react-native";

const StatusPill = ({ label }: { label: string }) => (
  <Pill
    color="success"
    variant="subtle"
    size="lg"
    label={label}
    className="min-w-39 border border-green-250 px-3 py-2 dark:border-transparent"
  />
);

const Row = ({
  icon,
  action,
  status,
}: {
  icon: ReactNode;
  action: ReactNode;
  status: string;
}) => (
  <View className="flex-row items-center gap-4 rounded-xl border border-border-default px-4 py-4">
    <View className="size-11 items-center justify-center rounded-full bg-bg-hover">
      {icon}
    </View>
    <View className="w-43.5 items-start gap-2">
      {action}
      <StatusPill label={status} />
    </View>
  </View>
);

export default function DeviceCheckCard() {
  return (
    <View className="mb-8 gap-3">
      <Row
        icon={<Mic />}
        action={<Button label="Test Microphone" className="w-full px-6" />}
        status="Ready"
      />
      <Row
        icon={<Camera />}
        action={
          <Button
            label="Test Camera"
            variant="secondary"
            className="w-full border-bg-band-lemon px-6"
            labelClassName="text-text-primary"
          />
        }
        status="Off"
      />
      <Row
        icon={<Wifi />}
        action={
          <Text className="font-body-sm text-body-sm text-text-secondary">
            Low-bandwidth mode available
          </Text>
        }
        status="Low"
      />
    </View>
  );
}
