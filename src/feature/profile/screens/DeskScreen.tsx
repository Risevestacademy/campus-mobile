import { Back, Skeleton } from "@shared/components";
import {
  Avatar,
  Card,
  Row,
  Switch,
  Text,
  toast,
} from "@shared/components/atoms";
import SafeArea from "@shared/components/safearea/SafeArea";
import { getInitials } from "@shared/helpers";
import { useMe } from "@shared/hooks/useMe";
import { useWs } from "@shared/hooks/useWs";
import { cn } from "@shared/utils/style";
import { useIsWatching, useSpaceOf } from "@store/world";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  FileText,
  Hand,
  Laptop,
  Link,
  MapPin,
  MessageCircle,
  Navigation,
  UserRound,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { withUniwind } from "uniwind";

import { ProfileSeparatedCard } from "../components";
import { useGetMemberProfile } from "../hooks";

const StyledHand = withUniwind(Hand);
const StyledMessageCircle = withUniwind(MessageCircle);
const StyledNavigation = withUniwind(Navigation);
const StyledLaptop = withUniwind(Laptop);
const StyledMapPin = withUniwind(MapPin);

export function DeskScreen() {
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  const router = useRouter();
  const { data: me, isLoading: isMeLoading } = useMe();
  const profileId = userId ?? me?.user.id;
  const { data, isLoading: isProfileLoading } = useGetMemberProfile(profileId);
  const isLoading = isMeLoading || isProfileLoading;

  // Until you're known, a desk opened by id could still turn out to be yours.
  const ownerKnown = !userId || Boolean(me);
  const isOwnDesk = !userId || userId === me?.user.id;
  const isOtherDesk = ownerKnown && !isOwnDesk;

  // The cohort you're in now, else the first one the two of you share.
  const membership =
    data?.memberships.find((e) => e.cohort.id === me?.membership?.cohortId) ??
    data?.memberships.at(0);
  // Track is null for staff.
  const membershipLine = [membership?.track?.name, membership?.cohort.name]
    .filter(Boolean)
    .join(" · ");
  const bio = data?.bio?.trim();

  // Where they are on campus. World doesn't say which space a desk is in yet,
  // so this can't tell "at their desk" apart from anywhere else.
  const location = useSpaceOf(isOtherDesk ? profileId : undefined);
  const watching = useIsWatching();
  const { send } = useWs();
  const name = data?.displayName ?? "them";

  /** Has world walk you to them; it says so if you're not connected. */
  const goTo = () => {
    if (!profileId) return;
    if (!send({ type: "goTo", userId: profileId })) {
      toast.error(
        "You're not connected to campus right now.",
        "Can't walk there",
      );
      return;
    }
    toast.success(`Walking to ${name}`);
  };

  // Wave and Message wait on their own flows: world has no wave yet.
  const actions = [
    { text: "Wave", icon: StyledHand },
    { text: "Message", icon: StyledMessageCircle },
    {
      text: "Go to",
      icon: StyledNavigation,
      onPress: goTo,
      // Only when they're on campus, and this device stands for you.
      disabled: !location || watching,
    },
  ];

  const [showAvailability, setShowAvailability] = useState(true);
  const [allowWaves, setAllowWaves] = useState(true);
  const [showPortfolio, setShowPortfolio] = useState(true);

  const settings = useMemo(
    () => [
      {
        icon: FileText,
        title: "Current project",
        subtitle: "Portfolio case study",
      },
      {
        icon: UserRound,
        title: "Show my availability",
        surfix: (
          <Switch
            value={showAvailability}
            onChange={setShowAvailability}
            accessibilityLabel="Show my availability"
          />
        ),
      },
      {
        icon: Hand,
        title: "Let people wave at me",
        surfix: (
          <Switch
            value={allowWaves}
            onChange={setAllowWaves}
            accessibilityLabel="Let people wave at me"
          />
        ),
      },
      {
        icon: Link,
        title: "Show my portfolio link",
        surfix: (
          <Switch
            value={showPortfolio}
            onChange={setShowPortfolio}
            accessibilityLabel="Show my portfolio link"
          />
        ),
      },
    ],
    [showAvailability, allowWaves, showPortfolio],
  );

  return (
    <SafeArea className="p-0" edges={[]}>
      <View className="gap-3 bg-bg-band-sky-soft p-6 pt-safe-offset-3">
        <Back />
        <Skeleton isLoading={isLoading} radius="round" className="self-center">
          <Avatar
            size={96}
            imageUrl={data?.avatarUrl ?? undefined}
            placeholder={getInitials(data?.displayName ?? "", {
              onlyFirst: true,
            })}
            className="self-center border-4 border-bg-on-colour bg-identity-sky"
          />
        </Skeleton>
        <View className="items-center gap-1 self-center">
          <Skeleton isLoading={isLoading} width={180} radius={8}>
            <Text variant="h1" className="text-center">
              {data?.displayName}
            </Text>
          </Skeleton>
          <Skeleton isLoading={isLoading} width={160} radius={8}>
            <Text variant="body-sm" className="text-center">
              {membershipLine}
            </Text>
          </Skeleton>
          <Row className="gap-1 rounded-full bg-overlay-white-15/14 px-3 py-1">
            {isOwnDesk ? (
              <>
                <StyledLaptop size={14} colorClassName="accent-text-primary" />
                <Text>Desks are claimed on desktop</Text>
              </>
            ) : (
              <>
                <StyledMapPin size={14} colorClassName="accent-text-primary" />
                <Text>{location ?? "Not on campus"}</Text>
              </>
            )}
          </Row>
        </View>
      </View>
      <View className="gap-4 p-6">
        {isOtherDesk ? (
          <View className="flex-row gap-2">
            {actions.map((e) => {
              const Icon = e.icon;
              return (
                <Pressable
                  key={e.text}
                  className={cn("flex-1", e.disabled && "opacity-50")}
                  onPress={e.onPress}
                  disabled={!e.onPress || e.disabled}
                  accessibilityRole="button"
                  accessibilityLabel={`${e.text} ${name}`}
                  accessibilityState={{ disabled: !e.onPress || e.disabled }}
                >
                  <Card className="items-center justify-center gap-1 rounded-lg border border-border-default px-2 py-3">
                    <Icon colorClassName="accent-text-link" />
                    <Text className="text-center" variant="body-md">
                      {e.text}
                    </Text>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        ) : null}
        <Card>
          <Row justify="between">
            <Text variant="overline" className="text-text-lemon-soft">
              Bio
            </Text>
            {isOwnDesk && (
              <Pressable
                onPress={() => router.push("/edit-profile")}
                accessibilityRole="button"
                accessibilityLabel="Edit bio"
                hitSlop={8}
              >
                <Text color="link" variant="label">
                  Edit
                </Text>
              </Pressable>
            )}
          </Row>
          <Skeleton isLoading={isLoading} radius={8} className="w-full">
            {bio ? (
              <Text>“{bio}”</Text>
            ) : (
              <Text color="secondary">
                {isOwnDesk
                  ? "Add a short bio so people know what you're working on."
                  : "No bio yet."}
              </Text>
            )}
          </Skeleton>
        </Card>
        {isOtherDesk ? (
          <Card>
            <Text variant="overline" className="text-text-link">
              Working on
            </Text>
          </Card>
        ) : null}
        {isOwnDesk ? <ProfileSeparatedCard data={settings} /> : null}
      </View>
    </SafeArea>
  );
}
