import { Avatar, Card, Row, Text, TextField } from "@shared/components/atoms";
import SafeArea from "@shared/components/safearea/SafeArea";
import { capitalize, getInitials } from "@shared/helpers";
import { useMe } from "@shared/hooks/useMe";
import { LoaderCircle, Lock } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { withUniwind } from "uniwind";

import { HeaderWithBack } from "../components";
import { useProfile, useUpdateProfile } from "../hooks";
import { useHasProfileChanges, useProfileUpdateStore } from "../store";

const StyledLock = withUniwind(Lock);
const StyledLoaderCircle = withUniwind(LoaderCircle);

export function EditProfileScreen() {
  const { data, refetch } = useProfile();
  const { update, isUpdating } = useUpdateProfile();
  const draft = useProfileUpdateStore((state) => state.draft);
  const setField = useProfileUpdateStore((state) => state.setField);
  const hydrate = useProfileUpdateStore((state) => state.hydrate);
  const reset = useProfileUpdateStore((state) => state.reset);
  const hasChanges = useHasProfileChanges();
  const { data: me } = useMe();
  const activeMembership = data?.memberships.find(
    (e) => e.cohort.id === me?.membership?.cohortId,
  );

  React.useEffect(() => {
    if (data) hydrate(data);
  }, [data, hydrate]);

  // Unsaved edits are discarded when leaving the screen
  React.useEffect(() => reset, [reset]);

  const updateProfile = async () => {
    const data = await update(draft);
    hydrate(data);
    void refetch();
  };
  const rotation = useSharedValue(0);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  React.useEffect(() => {
    if (isUpdating) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 800, easing: Easing.linear }),
        -1,
        false,
      );
    } else {
      rotation.value = 0;
    }
  }, [isUpdating, rotation]);

  return (
    <SafeArea>
      <HeaderWithBack
        title="Edit profile"
        action={
          <Pressable
            disabled={!hasChanges}
            accessibilityRole="button"
            accessibilityState={{ disabled: !hasChanges }}
          >
            {isUpdating ? (
              <Animated.View style={spinStyle}>
                <StyledLoaderCircle
                  size={20}
                  colorClassName="accent-text-on-dark"
                />
              </Animated.View>
            ) : (
              hasChanges && (
                <Text onPress={updateProfile} variant="label" color="link">
                  Save
                </Text>
              )
            )}
          </Pressable>
        }
      />
      <ScrollView contentContainerClassName="gap-4 items-stretch">
        <View className="items-center gap-2 self-center pt-5">
          <Avatar
            size={88}
            imageUrl={data?.avatarUrl ?? undefined}
            placeholderClassName="text-h4 text-text-on-dark"
            placeholder={getInitials(data?.displayName ?? "", {
              onlyFirst: true,
            })}
          />
          <Text variant="label" color="link">
            Change photo
          </Text>
        </View>
        <TextField
          label="Display name"
          placeholder="Ada L."
          value={draft.displayName}
          onChangeText={(value) => setField("displayName", value)}
        />
        <TextField
          placeholder="+234 906 827 2767"
          label="Phone"
          keyboardType="phone-pad"
          value={draft.phone}
          onChangeText={(value) => setField("phone", value)}
        />
        <TextField
          label="Bio"
          value={draft.bio}
          placeholder="Coding and designs..."
          onChangeText={(value) => setField("bio", value)}
          multiline
          numberOfLines={4}
          inputClassName="h-20"
          helper="Shown on your desk"
        />
        <Card gap="sm">
          <Row gap="sm">
            <StyledLock size={14} colorClassName="accent-text-muted" />
            <Text variant="label">Set by your invite</Text>
          </Row>
          <Row justify="between">
            <Text color="secondary" variant="caption">
              Role
            </Text>
            <Text variant="label">
              {capitalize(activeMembership?.role ?? "")}
            </Text>
          </Row>
          <Row justify="between">
            <Text color="secondary" variant="caption">
              Cohort
            </Text>
            <Text variant="label">{activeMembership?.cohort.name}</Text>
          </Row>
          <Row justify="between">
            <Text color="secondary" variant="caption">
              Track
            </Text>
            <Text variant="label">{activeMembership?.track?.name}</Text>
          </Row>
          <Row justify="between">
            <Text color="secondary" variant="caption">
              Mentorship group
            </Text>
            <Text variant="label">N/A</Text>
          </Row>
          <Row justify="between">
            <Text color="secondary" variant="caption">
              Signs in with
            </Text>
            <Text variant="label">{data?.email}</Text>
          </Row>
          <Text variant="caption" color="muted">
            Need a change? Ask a Campus admin.
          </Text>
        </Card>
      </ScrollView>
    </SafeArea>
  );
}
