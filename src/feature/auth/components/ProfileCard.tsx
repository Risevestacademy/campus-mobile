import { Pill, Text, TextField } from "@shared/components/atoms";
import { getInitials } from "@shared/helpers";
import { View } from "react-native";

interface ProfileCardProps {
  name?: string;
  cohort?: string;
  bio: string;
  onBioChange: (bio: string) => void;
}

export default function ProfileCard({
  name = "Joseph Akintomide",
  cohort = "Product Design · Cohort 2026",
  bio,
  onBioChange,
}: ProfileCardProps) {
  return (
    <View className="overflow-hidden rounded-3xl border border-border-default bg-bg-page">
      <View className="h-30.75 items-center justify-center bg-turquoise-600">
        <Text className="font-overline text-[32px] text-text-on-dark">
          {getInitials(name)}
        </Text>
      </View>

      <View className="items-center px-6 pt-4 pb-6">
        <Text className="mb-2 text-center font-h4 text-h4 text-text-primary">
          {name}
        </Text>
        <Text className="mb-6 text-center font-caption text-caption text-text-secondary">
          {cohort}
        </Text>
        <Text className="mb-4 text-center font-body-lg text-body-lg text-text-secondary">
          {bio}
        </Text>
        <View className="mb-2.75">
          <Pill color="success" variant="solid" size="lg" label="Available" />
        </View>

        <TextField
          label="Short bio"
          value={bio}
          onChangeText={onBioChange}
          multiline
          // containerClassName="mt-1"
          labelClassName="font-label text-label text-text-secondary"
        />
      </View>
    </View>
  );
}
