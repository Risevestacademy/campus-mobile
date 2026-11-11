import { type DeskTarget, deskTarget, useMyDesk } from "@shared/hooks/useDesks";

import { useDeskPreview } from "./useDeskPreview";

/**
 * Where your desk is on the map, or null: no desk, or the API can't place it
 * yet. Development builds fall back to the preview stand-in.
 */
export function useMyDeskTarget(): DeskTarget | null {
  const desk = useMyDesk();
  const preview = useDeskPreview();
  return (desk ? deskTarget(desk) : null) ?? preview;
}
