import { toast } from "@shared/components/atoms";
import SafeArea from "@shared/components/safearea/SafeArea";
import { useWs } from "@shared/hooks/useWs";
import { Status } from "@shared/lib/generated/world-protocol";
import { useCampusCount, useMyStatus, useWorldReady } from "@store/world";
import { ScrollView } from "react-native";

import { CampusHeader, HappeningAroundYou, Spaces } from "../components";

export function CampusScreen() {
  const { send } = useWs();
  const ready = useWorldReady();
  const availabilityStatus = useMyStatus();
  const userCount = useCampusCount();

  // Shown once world echoes it back as `statusChanged`, not before.
  const changeStatus = (status: Status) => {
    if (!send({ type: "setStatus", status })) {
      toast.error("You're not connected to campus. Try again in a moment.");
    }
  };

  return (
    <SafeArea className="p-0" edges={[]}>
      <CampusHeader
        status={availabilityStatus}
        onStatusChange={changeStatus}
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
