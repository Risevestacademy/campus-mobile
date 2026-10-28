import { useAvailability } from "@core/realtime";
import SafeArea from "@shared/components/safearea/SafeArea";
import { useCampusCount, useWorldReady } from "@store/world";
import { ScrollView } from "react-native";

import { CampusHeader, HappeningAroundYou, Spaces } from "../components";

export function CampusScreen() {
  const ready = useWorldReady();
  const userCount = useCampusCount();
  const { status, setStatus } = useAvailability();

  return (
    <SafeArea className="p-0" edges={[]}>
      <CampusHeader
        status={status}
        onStatusChange={setStatus}
        noOfParticipants={ready ? userCount : undefined}
      />
      <ScrollView
        contentContainerClassName="py-5 gap-5"
        showsVerticalScrollIndicator={false}
      >
        <HappeningAroundYou location="Main Hallway" />
        <Spaces />
      </ScrollView>
    </SafeArea>
  );
}
