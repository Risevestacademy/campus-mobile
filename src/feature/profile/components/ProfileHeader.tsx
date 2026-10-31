import { useAvailability } from "@core/realtime";
import { ActivityToggle, Skeleton } from "@shared/components";
import { Avatar, Row, Text } from "@shared/components/atoms";
import { capitalize, getInitials } from "@shared/helpers";
import { useMe } from "@shared/hooks/useMe";
import { useRouter } from "expo-router";
import { ChevronLeft, Pencil } from "lucide-react-native";
import React from "react";
import { Pressable, TouchableOpacity, View } from "react-native";
import { withUniwind } from "uniwind";

import { useProfile } from "../hooks";

const StyledPencil = withUniwind(Pencil);
const StyledChevronLeft = withUniwind(ChevronLeft);

export function DefaultHeader() {
  const { data: userData, isLoading: isUserLoading } = useMe();
  const { data: profileData, isLoading: isProfileLoading } = useProfile();
  const { status, setStatus } = useAvailability();
  const router = useRouter();
  const isMembershipLoading = isUserLoading || isProfileLoading;

  const profile = userData?.user;
  const activeMembership = profileData?.memberships.find(
    (e) => e.cohort.id === userData?.membership?.cohortId,
  );
  // Parts are missing until memberships load, and track is null for staff.
  const membershipLine = [
    capitalize(activeMembership?.role ?? ""),
    activeMembership?.track?.name,
    activeMembership?.cohort.name,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <View className="gap-3 bg-bg-band p-5 pt-safe-offset-5">
      <Row justify="between">
        <Text variant="h3" className="text-text-on-dark">
          Me
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push("/edit-profile")}
        >
          <Row className="rounded-full bg-overlay-white-15 px-3 py-2" gap="sm">
            <StyledPencil size={14} colorClassName="accent-text-on-dark" />
            <Text variant="label" className="text-text-on-dark">
              Edit
            </Text>
          </Row>
        </TouchableOpacity>
      </Row>
      <Row gap="md">
        <Skeleton isLoading={isUserLoading} radius="round">
          <Avatar
            imageUrl={profile?.avatarUrl ?? undefined}
            placeholder={
              profile?.displayName
                ? getInitials(profile.displayName!, { onlyFirst: true })
                : undefined
            }
          />
        </Skeleton>
        {/* While loading, sample text gives the skeletons a realistic shape;
            it's never shown. */}
        <View className="items-start gap-1">
          <Skeleton isLoading={isUserLoading} radius={8}>
            <Text className="text-text-on-dark" variant="h5">
              {isUserLoading ? "Ada Lovelace" : profile?.displayName}
            </Text>
          </Skeleton>
          {isMembershipLoading || membershipLine ? (
            <Skeleton isLoading={isMembershipLoading} radius={8}>
              <Text className="text-text-on-dark" variant="caption">
                {isMembershipLoading
                  ? "Student · Track · Cohort"
                  : membershipLine}
              </Text>
            </Skeleton>
          ) : null}
        </View>
      </Row>
      {/* Status comes from world, after the socket's first snapshot. */}
      <Skeleton isLoading={!status} radius="round">
        <ActivityToggle
          status={status}
          onChange={setStatus}
          containerClassName="px-3 py-2 gap-2 bg-bg-card"
          iconColorClassName="accent-text-muted"
          textClassName="flex-1 text-text-primary"
        />
      </Skeleton>
    </View>
  );
}

type HeaderWithBackProps = {
  title: string;
  action?: React.ReactNode;
};

export function HeaderWithBack({ title, action }: HeaderWithBackProps) {
  const router = useRouter();
  return (
    <View className="border-b border-b-border-default p-4">
      <Row gap="sm">
        <Pressable onPress={() => router.back()}>
          <StyledChevronLeft colorClassName="accent-text-on-dark" size={24} />
        </Pressable>
        <Text className="flex-1" variant="h5">
          {title}
        </Text>
        {action}
      </Row>
    </View>
  );
}
