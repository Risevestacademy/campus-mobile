import { ActivityToggle, Skeleton } from "@shared/components";
import { Avatar, StatusDot, Text } from "@shared/components/atoms";
import { useMe } from "@shared/hooks/useMe";
import { Status } from "@shared/lib/generated/world-protocol";
import { MessageCircleWarning, Navigation, Search } from "lucide-react-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

import { LiveMeeting } from "./LiveMeeting";

type CampusHeaderProps = {
  /** Undefined until world reports it. */
  status?: Status;
  onStatusChange?: (status: Status) => void;
  /** Undefined while there's no current count to show. */
  noOfParticipants?: number;
  location?: string;
};

const StyledNavigation = withUniwind(Navigation);
const StyledSearch = withUniwind(Search);
const StyledMessageCircleWarning = withUniwind(MessageCircleWarning);

export function CampusHeader({
  status,
  onStatusChange,
  noOfParticipants,
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
          <Skeleton isLoading={isLoading || !status} radius="round">
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
          <Skeleton isLoading={isLoading || !status} radius={16}>
            <ActivityToggle status={status} onChange={onStatusChange} />
          </Skeleton>
        </View>
        <View className="flex grow flex-row gap-3">
          <IconOverlay>
            <StyledSearch size={20} colorClassName="accent-text-on-dark" />
          </IconOverlay>
          <IconOverlay>
            <StyledMessageCircleWarning
              size={20}
              colorClassName="accent-text-on-dark"
            />
          </IconOverlay>
        </View>
      </View>
      <View className="items-start pt-7">
        <Skeleton isLoading={noOfParticipants === undefined} radius={16}>
          <Text variant="h3" className="text-action-accent">
            {noOfParticipants ?? 0}{" "}
            {noOfParticipants === 1 ? "person" : "people"} on campus now
          </Text>
        </Skeleton>
      </View>
      {location ? (
        <View className="flex-row items-center gap-1 pt-1 pb-4">
          <StyledNavigation
            colorClassName="accent-text-turquoise-fixed"
            size={14}
          />
          <Text variant="body-sm" className="text-text-rail">
            You’re at {location}
          </Text>
        </View>
      ) : (
        <View className="pb-4" />
      )}
      <LiveMeeting />
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
