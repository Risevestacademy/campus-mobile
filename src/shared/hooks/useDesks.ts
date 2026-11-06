import { type Desk, DeskService } from "@services/desks";
import { useQuery } from "@tanstack/react-query";

import { useMe } from "./useMe";

/** Prefix of every cohort's desks query, so `desksChanged` can refetch them. */
export const DESKS_QUERY_KEY = ["desks"] as const;

/** Where a desk is on the world map, and what to call it. */
export type DeskTarget = { spaceKey: string; name: string };

/**
 * The world space a desk sits in, and its display name. The API doesn't
 * expose either yet, so this is null for every desk and nothing offers to
 * walk there. Fill it in once `DeskDto` carries them.
 */
export function deskTarget(_desk: Desk): DeskTarget | null {
  return null;
}

/** The desk you hold in your cohort, or null: none claimed, or not loaded. */
export function useMyDesk(): Desk | null {
  const { data: me } = useMe();
  const cohortId = me?.membership?.cohortId;
  const myId = me?.user.id;

  const { data: desks } = useQuery({
    queryKey: [...DESKS_QUERY_KEY, cohortId],
    queryFn: () => DeskService.list(cohortId!),
    enabled: Boolean(cohortId),
  });

  return desks?.find((desk) => desk.holder?.id === myId) ?? null;
}
