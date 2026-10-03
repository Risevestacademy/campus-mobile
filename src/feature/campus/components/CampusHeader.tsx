import { Avatar, Text } from "@shared/components/atoms";
import { useMe } from "@shared/hooks/useMe";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActivityToggle } from "./ActivityToggle";

export function CampusHeader() {
  const { top } = useSafeAreaInsets();
  const { data: me } = useMe();

  const displayName = me?.user.displayName ?? "";
  const imageUrl = me?.user.avatarUrl ?? "";
  return (
    <View className="bg-bg-band px-6 pb-6" style={{ paddingTop: top + 16 }}>
      <View className="flex-row items-center gap-3">
        <View className="relative overflow-visible">
          <Avatar
            size={50}
            imageUrl={imageUrl}
            placeholder={displayName[0] ?? ""}
          />
          <View className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-bg-band bg-status-success"></View>
        </View>
        <View className="gap-2">
          <Text variant="h6" className="text-[18px] text-text-on-dark">
            Hi, {me?.user.firstName}
          </Text>
          <ActivityToggle />
        </View>
      </View>
    </View>
  );
}
