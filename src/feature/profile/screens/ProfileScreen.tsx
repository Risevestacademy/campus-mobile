import { Text } from "@shared/components/atoms";
import SafeArea from "@shared/components/safearea/SafeArea";
import {
  Armchair,
  Bell,
  FileText,
  Lock,
  Mic,
  Moon,
  UserRound,
} from "lucide-react-native";
import { useMemo } from "react";
import { FlatList, ScrollView, View } from "react-native";

import {
  DefaultHeader,
  ProfilePinnedProject,
  ProfileSeparatedCard,
} from "../components";

export function ProfileScreen() {
  const DESK = useMemo(
    () => [
      {
        title: "My projects",
        subtitle: "3 projects · 1 pinned",
        icon: FileText,
      },
      {
        title: "My desk",
        subtitle: "D-07 · Design faculty",
        icon: Armchair,
      },
      {
        title: "My character",
        subtitle: "Change how you look on the map",
        icon: UserRound,
      },
    ],
    [],
  );
  const SETTINGS = useMemo(
    () => [
      {
        title: "Notifications",
        icon: Bell,
      },
      {
        title: "Audio & Video",
        icon: Mic,
      },
      {
        title: "Privacy and safety",
        icon: Lock,
      },
      {
        title: "Appearance",
        subtitle: "System",
        icon: Moon,
      },
    ],
    [],
  );
  const projects = [
    {
      title: "Campus onboarding redesign",
      statusText: "Now: reworking the sign-in screens",
      links: [
        {
          link: "https://picsum.photos",
          type: "design",
        },
        {
          link: "https://picsum.photos",
          type: "repo",
        },
        {
          link: "https://picsum.photos",
          type: "demo",
        },
      ],
    },
    {
      title: "Writing a garbage collector",
      statusText: "Now: Restructuring the language",
      links: [
        {
          link: "https://picsum.photos",
          type: "repo",
        },
        {
          link: "https://picsum.photos",
          type: "demo",
        },
      ],
    },
  ];

  return (
    <SafeArea className="p-0" edges={[]}>
      <DefaultHeader />
      <ScrollView
        contentContainerClassName="py-4 gap-2"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-2">
          <Text color="secondary" variant="overline" className="pl-4">
            Pinned to my desk
          </Text>
          <FlatList
            pagingEnabled
            horizontal
            showsHorizontalScrollIndicator={false}
            data={projects}
            renderItem={({ item: e }) => (
              <View className="w-screen px-4">
                <ProfilePinnedProject project={e} />
              </View>
            )}
          />
        </View>
        <View className="gap-2 px-4">
          <ProfileSeparatedCard data={DESK} />
          <Text color="secondary" variant="overline">
            SETTINGS
          </Text>
          <ProfileSeparatedCard data={SETTINGS} />
        </View>
      </ScrollView>
    </SafeArea>
  );
}
