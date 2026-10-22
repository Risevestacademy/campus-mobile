import SafeArea from "@shared/components/safearea/SafeArea";
import { ScrollView } from "react-native";

import { CampusHeader, HappeningAroundYou, Spaces } from "../components";

export function CampusScreen() {
  return (
    <SafeArea className="bg-bg-band p-0">
      <CampusHeader />
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
