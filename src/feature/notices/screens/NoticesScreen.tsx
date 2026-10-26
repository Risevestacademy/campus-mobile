import { Text } from "@shared/components/atoms";
import SafeArea from "@shared/components/safearea/SafeArea";
import { useState } from "react";
import { ScrollView } from "react-native";

import {
  ExpiredFooter,
  NoticeRow,
  NoticesHeader,
  PinnedDeadlineCard,
  PinnedEventCard,
} from "../components";
import { useNotices } from "../hooks";
import type { NoticeFilter } from "../types";

function NoticesScreen() {
  const [filter, setFilter] = useState<NoticeFilter>("all");
  const { pinned, latest, newCount, expiredCount } = useNotices(filter);

  return (
    <SafeArea className="bg-bg-band-ink p-0" disableBottomInset>
      <NoticesHeader
        newCount={newCount}
        filter={filter}
        onFilterChange={setFilter}
      />
      <ScrollView
        className="bg-bg-page"
        contentContainerClassName="gap-3 px-6 py-5 pb-8"
      >
        {pinned.map((n) =>
          n.kind === "event" ? (
            <PinnedEventCard key={n.id} notice={n} />
          ) : (
            <PinnedDeadlineCard key={n.id} notice={n} />
          ),
        )}

        {latest.length > 0 ? (
          <>
            <Text variant="h5" className="mt-3 text-text-primary">
              Latest
            </Text>
            {latest.map((n) => (
              <NoticeRow key={n.id} notice={n} />
            ))}
          </>
        ) : null}

        <ExpiredFooter count={expiredCount} />
      </ScrollView>
    </SafeArea>
  );
}

export default NoticesScreen;
