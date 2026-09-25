import { Camera, Mic, Wifi } from "@shared/icons";
import { Text, View } from "react-native";

const Label = ({ type, text }: { type: "on" | "off"; text: string }) => {
  switch (type) {
    case "on":
      return (
        <View className="min-h-8 w-full max-w-40.75 items-center justify-center rounded-full border border-status-success-border bg-status-success-bg-subtle px-3 py-2">
          <Text className="font-label text-label text-status-success-text">
            {text}
          </Text>
        </View>
      );
    case "off":
      return (
        <View className="min-h-8 w-full max-w-40.75 items-center justify-center rounded-full border border-border-default bg-bg-surface px-3 py-2">
          <Text className="font-label text-label text-text-primary">
            {text}
          </Text>
        </View>
      );
  }
};

const Row = ({
  title,
  subtext,
  icon,
  labelType,
  labelText,
}: {
  title: string;
  subtext: string;
  icon: React.ReactNode;
  labelType: "on" | "off";
  labelText: string;
}) => {
  return (
    <View className="flex flex-row items-center gap-4 rounded-lg border border-border-default px-4 py-3.5">
      <View className="size-11 items-center justify-center rounded-full bg-bg-hover">
        {icon}
      </View>
      <View className="flex-1 gap-0.75">
        <View className="flex flex-row items-center justify-between gap-3">
          <Text className="font-h6 text-h6 text-text-primary">{title}</Text>
          <View className="flex-1">
            <Label type={labelType} text={labelText} />
          </View>
        </View>
        <Text className="font-body-sm text-body-sm text-text-link">
          {subtext}
        </Text>
      </View>
    </View>
  );
};

export default function DeviceCheckCard() {
  return (
    <View className="mb-8.75 gap-3">
      <Row
        icon={<Mic />}
        title="Microphone"
        subtext="Test microphone"
        labelType="on"
        labelText="Ready"
      />
      <Row
        icon={<Camera />}
        title="Camera"
        subtext="Test camera"
        labelType="off"
        labelText="Off"
      />
      <Row
        icon={<Wifi />}
        title="Connection"
        subtext="Low-bandwidth mode available"
        labelType="on"
        labelText="Good"
      />
    </View>
  );
}
