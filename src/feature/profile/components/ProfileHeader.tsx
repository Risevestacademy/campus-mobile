import { ActivityToggle } from "@shared/components";
import { Avatar, Row, Text } from "@shared/components/atoms";
import { capitalize, getInitials } from "@shared/helpers";
import { useMe } from "@shared/hooks/useMe";
import { Pencil } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { withUniwind } from "uniwind";

import { useProfile } from "../hooks";

const StyledPencil = withUniwind(Pencil);

export function DefaultHeader() {
  const { data: userData } = useMe();
  const { data: profileData } = useProfile();

  const profile = userData?.user;
  const activeMembership = profileData?.memberships.find(
    (e) => e.cohort.id === userData?.membership?.cohortId,
  );

  return (
    <View className="gap-3 bg-bg-band p-5 pt-safe-offset-5">
      <Row justify="between">
        <Text variant="h3" className="text-text-on-dark">
          Me
        </Text>
        <TouchableOpacity activeOpacity={0.8}>
          <Row className="rounded-full bg-overlay-white-15 px-3 py-2" gap="sm">
            <StyledPencil size={14} colorClassName="accent-text-on-dark" />
            <Text variant="label" className="text-text-on-dark">
              Edit
            </Text>
          </Row>
        </TouchableOpacity>
      </Row>
      <Row gap="md">
        <Avatar
          placeholder={
            profile?.displayName
              ? getInitials(profile.displayName!, { onlyFirst: true })
              : undefined
          }
        />
        <View>
          <Text className="text-text-on-dark" variant="h5">
            {profile?.displayName}
          </Text>
          <Text
            className="text-text-on-dark"
            variant="caption"
          >{`${capitalize(activeMembership?.role ?? "")} · ${activeMembership?.track?.name} · ${activeMembership?.cohort.name}`}</Text>
        </View>
      </Row>
      <ActivityToggle
        containerClassName="px-3 py-2 gap-2 bg-bg-card"
        iconColorClassName="accent-text-muted"
        textClassName="text-text-primary"
      />
    </View>
  );
}

export function HeaderWithBack() {
  return <View></View>;
}
