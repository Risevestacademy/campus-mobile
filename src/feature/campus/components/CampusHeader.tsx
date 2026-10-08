import { Avatar, Text } from "@shared/components/atoms";
import { Skeleton } from "@shared/components/Skeleton";
import { useMe } from "@shared/hooks/useMe";
import { Navigation } from "lucide-react-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

import { ActivityToggle } from "./ActivityToggle";
import { LiveMeeting } from "./LiveMeeting";

const StyledNavigation = withUniwind(Navigation);

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
      <Text variant="h3" className="pt-7 text-action-accent">
        18 people on campus now
      </Text>
      <View className="flex-row items-center gap-1 pt-1 pb-4">
        <StyledNavigation
          colorClassName="accent-text-turquoise-fixed"
          size={14}
        />
        <Text variant="body-sm" className="text-text-rail">
          You’re at your desk{" "}
        </Text>
      </View>
      <LiveMeeting />
    </View>
  );
}
