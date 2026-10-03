import SafeArea from "@shared/components/safearea/SafeArea";

import { CampusHeader } from "../components";

export function CampusScreen() {
  return (
    <SafeArea className="p-0" edges={[]}>
      <CampusHeader />
    </SafeArea>
  );
}
