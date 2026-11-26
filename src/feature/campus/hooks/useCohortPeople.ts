import { ProfileService } from "@services/profile";
import { useMe } from "@shared/hooks/useMe";
import { useQuery } from "@tanstack/react-query";

import type { CohortPerson } from "../types";

const NOBODY: CohortPerson[] = [];

/**
 * Everybody in your current cohort, online or not, from campus-api. Empty
 * until it loads; who of them is on campus comes from world.
 */
export function useCohortPeople(): CohortPerson[] {
  const { data: me } = useMe();
  const cohortId = me?.membership?.cohortId;

  const { data } = useQuery({
    queryKey: ["cohort/people", cohortId],
    queryFn: () => ProfileService.listCohortPeople(cohortId!),
    enabled: Boolean(cohortId),
  });

  return data ?? NOBODY;
}
