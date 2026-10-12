import SafeArea from "@shared/components/safearea/SafeArea";

import { CampusHeader } from "../components";

export function CampusScreen() {
  return (
    <SafeArea className="bg-bg-band p-0">
      <CampusHeader />
    </SafeArea>
  );
}
