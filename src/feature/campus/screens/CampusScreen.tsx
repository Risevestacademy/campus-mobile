import { toast } from "@shared/components/atoms";
import SafeArea from "@shared/components/safearea/SafeArea";
import { useWs, useWsMessage } from "@shared/hooks/useWs";
import { Status } from "@shared/lib/generated/world-protocol";
import React from "react";
import { ScrollView } from "react-native";

import { CampusHeader, HappeningAroundYou, Spaces } from "../components";

export function CampusScreen() {
  const { send } = useWs();
  const [availabilityStatus, setAvailabilityStatus] =
    React.useState<Status>("away");
  const [userCount, setUserCount] = React.useState<number>(0);
  // Only read inside handlers; a ref is current even when snapshot lands before a re-render.
  const userId = React.useRef<string | null>(null);

  useWsMessage("welcome", (m) => {
    userId.current = m.userId;
  });
  useWsMessage("snapshot", (m) => {
    const me = m.players.find((e) => e.userId === userId.current);
    if (me) setAvailabilityStatus(me.status);
    setUserCount(m.players.length);
  });
  useWsMessage("statusChanged", (m) => {
    if (m.userId === userId.current) setAvailabilityStatus(m.status);
  });

  const changeStatus = (status: Status) => {
    if (!send({ type: "setStatus", status })) {
      toast.error("You're not connected to campus. Try again in a moment.");
      return;
    }
    setAvailabilityStatus(status);
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
