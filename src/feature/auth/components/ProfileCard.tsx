import { getInitials } from "@shared/helpers";
import { Text, View } from "react-native";

export default function ProfileCard() {
  return (
    <View className="mb-5.75 rounded-xl border border-border-default bg-bg-surface px-4 pt-3.75 pb-3.25">
      <Text className="mb-4.75 font-overline text-overline text-text-brand">
        LIVE PROFILE PREVIEW
      </Text>
      <View className="flex flex-row items-center gap-4">
        <View className="size-16 items-center justify-center rounded-full bg-action-secondary-default">
          <Text className="font-h5 text-h5 text-text-primary">
            {getInitials("Joseph Akintomide")}
          </Text>
        </View>
        <View>
          <Text className="mb-2.25 font-h6 text-h6 text-text-primary">
            Joseph Akintomide
          </Text>
          <Text className="mb-2 font-caption text-caption text-text-secondary">
            Product Design · Cohort 2026
          </Text>
          <View className="h-8 w-40.75 items-center justify-center rounded-full border border-status-success-border bg-status-success-bg-subtle px-3 py-1.5">
            <Text className="font-label text-label text-status-success-text">
              Available
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
