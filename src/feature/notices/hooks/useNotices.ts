import { useMemo } from "react";

import { isExpired, matchesFilter } from "../helpers";
import { MOCK_NOTICES } from "../mocks/notices.mock";
import type { Notice, NoticeFilter } from "../types";

// Swap this for the real API query; keep the returned shape the same.
function useAllNotices(): Notice[] {
  return MOCK_NOTICES;
}

export function useNotices(filter: NoticeFilter) {
  const all = useAllNotices();

  return useMemo(() => {
    const active = all.filter((n) => !isExpired(n));
    const visible = active.filter((n) => matchesFilter(n, filter));

    return {
      pinned: visible.filter((n) => n.pinned),
      latest: visible
        .filter((n) => !n.pinned)
        .sort((a, b) => b.postedAt.localeCompare(a.postedAt)),
      newCount: active.filter((n) => n.isNew).length,
      expiredCount: all.length - active.length,
    };
  }, [all, filter]);
}
