import { Avatar, Text } from "@shared/components/atoms";
import { Skeleton } from "@shared/components/Skeleton";
import { useMe } from "@shared/hooks/useMe";
import { MessageCircleWarning, SearchIcon } from "lucide-react-native";
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
        <View className="flex grow flex-row gap-3">
          <IconOverlay>
            <SearchIcon width={20} height={20} color="#F7F7F7" />
          </IconOverlay>
          <IconOverlay>
            <MessageCircleWarning height={20} width={20} color="#F7F7F7" />
          </IconOverlay>
        </View>
      </View>
    </View>
  );
}

const IconOverlay = ({
  children,
  badge,
}: {
  children: React.ReactNode;
  badge?: number;
}) => (
  <View className="size-11 items-center justify-center rounded-full bg-overlay-white-15">
    {children}

    {badge && (
      <View className="absolute -top-1 right-px h-4.5 items-center justify-center rounded-full bg-action-accent px-1">
        <Text variant="overline" className="text-text-on-accent">
          {badge}
        </Text>
      </View>
    )}
  </View>
);
