import { ReactNode } from "react";

import { BottomSheet } from "./BottomSheet";

type MeetingJoinModalProps = {
  children: ReactNode;
};

export function MeetingJoinModal({ children }: MeetingJoinModalProps) {
  return <BottomSheet>{children}</BottomSheet>;
}
