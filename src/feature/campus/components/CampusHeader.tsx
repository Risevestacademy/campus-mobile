import { Avatar, Text } from "@shared/components/atoms";
import { Skeleton } from "@shared/components/Skeleton";
import { useMe } from "@shared/hooks/useMe";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActivityToggle } from "./ActivityToggle";

export function CampusHeader() {
  const { top } = useSafeAreaInsets();
  const { data: me, isLoading } = useMe();

  const displayName = me?.user.displayName ?? "";
  const imageUrl = me?.user.avatarUrl ?? "";
  return (
    <View className="bg-bg-band px-6 pb-6" style={{ paddingTop: top + 16 }}>
      <View className="flex-row items-center gap-3">
        <View className="relative overflow-visible">
          <Skeleton isLoading={isLoading} radius="round">
            <Avatar
              size={50}
              imageUrl={imageUrl}
              placeholder={displayName[0] ?? ""}
            />
          </Skeleton>
          <Skeleton isLoading={isLoading} radius="round">
            <View className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-bg-band bg-status-success"></View>
          </Skeleton>
        </View>
        <View className="items-start gap-2">
          <Skeleton isLoading={isLoading} radius={16} width={200}>
            <Text variant="h6" className="text-[18px] text-text-on-dark">
              Hi, {me?.user.firstName}
            </Text>
          </Skeleton>
          <Skeleton isLoading={isLoading} radius={16}>
            <ActivityToggle />
          </Skeleton>
        </View>
      </View>
    </View>
  );
}
