import { toast } from "@shared/components/atoms";
import SafeArea from "@shared/components/safearea/SafeArea";
import { useMeetingJoin } from "@shared/hooks/ui";
import { useMyDesk } from "@shared/hooks/useDesks";
import { useWs } from "@shared/hooks/useWs";
import type { ClientMessage } from "@shared/lib/ws";
import { useMySpace } from "@store/world";
import { useRouter } from "expo-router";
import React from "react";

import {
  SearchBar,
  SearchFilters,
  SearchHome,
  type SearchResultActions,
  SearchResultsList,
} from "../components";
import { toSearchHomeSections } from "../helpers";
import {
  useCampusSearch,
  useGoToSpace,
  useHappeningNow,
  useMyDeskTarget,
  useRecentSearches,
} from "../hooks";
import type { LiveMeetingItem, QuickAction, SearchFilter } from "../types";

export function SearchScreen() {
  const router = useRouter();
  const { open } = useMeetingJoin();
  const { send } = useWs();
  const { goToSpace } = useGoToSpace();
  const myDesk = useMyDeskTarget();
  const holdsDesk = useMyDesk() !== null;
  const mySpace = useMySpace();
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<SearchFilter>("all");
  const sections = useCampusSearch(query, filter);
  const live = useHappeningNow();
  const recent = useRecentSearches();
  const homeSections = React.useMemo(
    () => toSearchHomeSections({ live, recent: recent.queries }),
    [live, recent.queries],
  );

  const showHome = query.trim() === "" && filter === "all";

  const openMeeting = (meeting: LiveMeetingItem) =>
    open({
      meetingId: meeting.id,
      title: meeting.title,
      location: meeting.location,
      startsAt: new Date(meeting.startsAt),
      participants: [],
    });

  /** Asks world to walk you there; true when it was sent. */
  const walk = (message: ClientMessage) => {
    const sent = send(message);
    if (!sent) {
      toast.error(
        "You're not connected to campus right now.",
        "Can't walk there",
      );
    }
    return sent;
  };

  // Wave, meetings and resources wait on their own flows.
  const resultActions: SearchResultActions = {
    onGoToPerson: (person) => walk({ type: "goTo", userId: person.id }),
    // useGoToSpace reports a refused or blocked walk when it ends.
    onGoToSpace: (space) => {
      if (goToSpace(space.id, space.name)) {
        toast.success(`Walking to ${space.name}`);
      }
    },
  };

  const goToMyDesk = () => {
    if (!myDesk && holdsDesk) {
      // The API can't say where desks are on the map yet.
      toast.error("Walking to desks isn't available yet.", "Can't get there");
      return;
    }
    if (!myDesk) {
      toast.error(
        "Claim a desk first, then you can walk to it from here.",
        "No desk yet",
      );
      return;
    }
    if (mySpace?.spaceKey === myDesk.spaceKey) {
      toast.success("You're already at your desk");
      return;
    }
    // Refused or blocked walks are reported by useGoToSpace when they end.
    if (goToSpace(myDesk.spaceKey, myDesk.name)) {
      toast.success("Walking to your desk");
    }
  };

  const runAction = (action: QuickAction) => {
    switch (action.key) {
      case "myDesk":
        goToMyDesk();
        return;
      // TODO: wire each once its flow exists.
      case "newMeeting":
      case "classroom":
        return;
    }
  };

  return (
    <SafeArea className="p-0">
      <SearchBar
        value={query}
        onChangeText={setQuery}
        onSubmit={recent.add}
        onBack={router.back}
      />
      {showHome ? (
        <SearchHome
          sections={homeSections}
          onOpenMeeting={openMeeting}
          onSearch={setQuery}
          onRemoveRecent={recent.remove}
          onClearRecent={recent.clear}
          onAction={runAction}
        />
      ) : (
        <>
          <SearchFilters selected={filter} onSelect={setFilter} />
          <SearchResultsList
            sections={sections}
            query={query}
            showHeaders={filter === "all"}
            actions={resultActions}
          />
        </>
      )}
    </SafeArea>
  );
}
