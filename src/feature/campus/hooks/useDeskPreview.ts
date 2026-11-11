import type { DeskTarget } from "@shared/hooks/useDesks";
import { useWorldStore } from "@store/world";
import React from "react";

// IMPORTANT: Remove this once the desk is live. For preview only
/**
 * Development builds only: until `deskTarget()` can place a desk on the map,
 * a real space stands in as "your desk" so the shortcut can be seen and
 * tried. The walk is real, so walking there shows "At your desk". Delete
 * this once the API gives a desk's space key and name.
 */
export function useDeskPreview(): DeskTarget | null {
  const spaces = useWorldStore((state) => state.spaces);

  return React.useMemo(() => {
    if (!__DEV__) return null;
    const drawn = Object.values(spaces)
      .filter((space) => space.spaceKey !== "_default")
      .sort((a, b) => a.spaceKey.localeCompare(b.spaceKey));

    const stand =
      drawn.find((space) => space.spaceKey.includes("desk")) ?? drawn[0];
    return stand ? { spaceKey: stand.spaceKey, name: stand.name } : null;
  }, [spaces]);
}
