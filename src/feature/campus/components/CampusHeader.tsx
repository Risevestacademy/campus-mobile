import { Avatar, StatusDot, Text } from "@shared/components/atoms";
import { Skeleton } from "@shared/components/Skeleton";
import { useMe } from "@shared/hooks/useMe";
import { Status } from "@shared/lib/generated/world-protocol";
import { Navigation } from "lucide-react-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

import { ActivityToggle } from "./ActivityToggle";
import { LiveMeeting } from "./LiveMeeting";

type CampusHeaderProps = {
  status?: Status;
  onStatusChange?: (status: Status) => void;
  noOfParticipants?: number;
  location?: string;
};

const StyledNavigation = withUniwind(Navigation);

export function CampusHeader({
  status,
  onStatusChange,
  noOfParticipants = 0,
  location,
}: CampusHeaderProps) {
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
            <StatusDot
              status={status}
              className="absolute right-0 bottom-0 size-3 border-2 border-bg-band"
            />
          </Skeleton>
        </View>
        <View className="items-start gap-2">
          <Skeleton isLoading={isLoading} radius={16} width={200}>
            <Text variant="h6" className="text-[18px] text-text-on-dark">
              Hi, {me?.user.firstName}
            </Text>
          </Skeleton>
          <Skeleton isLoading={isLoading} radius={16}>
            <ActivityToggle status={status} onChange={onStatusChange} />
          </Skeleton>
        </View>
      </View>
      <Text variant="h3" className="pt-7 text-action-accent">
        {noOfParticipants} {`${noOfParticipants === 1 ? "person" : "people"}`}{" "}
        on campus now
      </Text>
      <View className="flex-row items-center gap-1 pt-1 pb-4">
        <StyledNavigation
          colorClassName="accent-text-turquoise-fixed"
          size={14}
        />
        <Text variant="body-sm" className="text-text-rail">
          You’re at {location}
        </Text>
      </View>
      <LiveMeeting />
    </View>
  );
}
