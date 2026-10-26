import { toast } from "@shared/components/atoms";
import SafeArea from "@shared/components/safearea/SafeArea";
import { useWs } from "@shared/hooks/useWs";
import { Status } from "@shared/lib/generated/world-protocol";
import { useCampusCount, useMyStatus, useWorldStore } from "@store/world";
import { ScrollView } from "react-native";

import { CampusHeader, HappeningAroundYou, Spaces } from "../components";

export function CampusScreen() {
  const { send } = useWs();
  const availabilityStatus = useMyStatus();
  const userCount = useCampusCount();
  const setOwnStatus = useWorldStore((state) => state.setOwnStatus);

  const changeStatus = (status: Status) => {
    if (!send({ type: "setStatus", status })) {
      toast.error("You're not connected to campus. Try again in a moment.");
      return;
    }
    setOwnStatus(status);
  };

  return (
    <SafeArea className="p-0" edges={[]}>
      <CampusHeader
        status={availabilityStatus}
        onStatusChange={changeStatus}
        noOfParticipants={userCount}
        location=""
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
