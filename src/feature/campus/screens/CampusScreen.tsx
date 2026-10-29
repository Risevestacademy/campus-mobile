import { useAvailability } from "@core/realtime";
import SafeArea from "@shared/components/safearea/SafeArea";
import { useCampusCount, useMySpace, useWorldReady } from "@store/world";
import { View } from "react-native";
import Animated from "react-native-reanimated";

import {
  CampusHeaderBar,
  CampusHeaderHero,
  HappeningAroundYou,
  LiveMeeting,
  Spaces,
} from "../components";
import { useCollapsingHeader } from "../hooks";

export function CampusScreen() {
  const ready = useWorldReady();
  const userCount = useCampusCount();
  const spaceKey = useMySpace();
  const { status, setStatus } = useAvailability();
  const header = useCollapsingHeader();

  const noOfParticipants = ready ? userCount : undefined;
  const location = ready ? spaceKey : undefined;

  return (
    <SafeArea className="p-0" edges={[]}>
      <Animated.ScrollView
        onScroll={header.onScroll}
        scrollEventThrottle={16}
        // Content starts under the pinned bar.
        contentContainerStyle={{ paddingTop: header.barHeight }}
        contentContainerClassName="gap-5 pb-5"
        showsVerticalScrollIndicator={false}
      >
        <CampusHeaderHero
          noOfParticipants={noOfParticipants}
          location={location?.name}
          progress={header.progress}
          onSummaryLayout={header.onSummaryLayout}
        />
        <View className="px-6">
          <LiveMeeting />
        </View>
        <HappeningAroundYou location="Main Hallway" />
        <Spaces />
      </Animated.ScrollView>
      <CampusHeaderBar
        status={status}
        onStatusChange={setStatus}
        noOfParticipants={noOfParticipants}
        location={location?.name}
        scrollY={header.scrollY}
        summaryY={header.summaryY}
        progress={header.progress}
        collapsed={header.collapsed}
        onLayout={header.onBarLayout}
      />
    </SafeArea>
  );
}
