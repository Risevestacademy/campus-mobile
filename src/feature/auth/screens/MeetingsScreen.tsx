import { Avatar, Button, Divider, Text } from "@shared/components/atoms";
import SafeArea from "@shared/components/safearea/SafeArea";
import { ScrollView, View } from "react-native";

import { MeetingParticipants } from "../components";

const UPCOMING_MEETINGS = [
  { time: "12:00 - 13:00", title: "UI/UX Design workshop" },
  { time: "13:00 - 14:00", title: "Frontend Development Workshop" },
];

export default function MeetingsScreen() {
  return (
    <SafeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mt-4 flex-row items-center gap-4">
          <Avatar size={56} placeholder="JA" bg="#2AADA0" />
          <View className="flex-1 gap-1">
            <Text className="font-h4 text-h4 text-text-primary">
              Joseph Akintomide
            </Text>
            <Text className="font-caption text-caption text-text-secondary">
              Product Design · Cohort 2026
            </Text>
          </View>
        </View>

        <View className="mt-4 mb-6 flex-row items-center gap-3">
          <Text className="font-overline text-overline text-[#000000]">
            Thursday
          </Text>
          <View className="size-3 overflow-hidden rounded-full bg-[#000000]" />
          <Text className="font-label text-label text-[#000000]">
            24 September 2026
          </Text>
        </View>

        <Divider />

        <Text className="mt-6.25 mb-4 font-caption text-caption text-text-secondary">
          Meeting now
        </Text>
        <View className="gap-3 rounded-lg border border-border-default bg-status-success-subtle p-2.5">
          <Text className="font-caption text-caption text-[#000000]">
            12:00 - 13:00
          </Text>
          <Text className="font-caption text-caption text-[#000000]">
            UI/UX Design class
          </Text>
          <MeetingParticipants others={12} />
        </View>
        <Button label="Join now" className="mt-2 self-start px-6" />

        <Text className="mt-6.25 mb-4 font-caption text-caption text-text-secondary">
          Upcoming meetings
        </Text>
        <View className="gap-5">
          {UPCOMING_MEETINGS.map(({ time, title }) => (
            <View key={title} className="gap-2">
              <Text className="font-caption text-caption text-[#000000]">
                {time}
              </Text>
              <Text className="font-caption text-caption text-[#000000]">
                {title}
              </Text>
              <MeetingParticipants others={12} />
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="py-2">
        <Button label="Enter App" />
      </View>
    </SafeArea>
  );
}
