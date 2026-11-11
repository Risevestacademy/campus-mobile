import type {
  LiveMeetingItem,
  QuickAction,
  SearchHomeItem,
  SearchHomeSection,
} from "../types";

export const QUICK_ACTIONS: QuickAction[] = [
  { key: "newMeeting", label: "New meeting" },
  { key: "myDesk", label: "My desk" },
  { key: "classroom", label: "Rise classroom" },
];

/**
 * What to show before you type: what's on now, your recent searches, then
 * quick actions. Empty sections are left out; quick actions always show.
 */
export function toSearchHomeSections({
  live,
  recent,
}: {
  live: LiveMeetingItem[];
  recent: string[];
}): SearchHomeSection[] {
  const sections: SearchHomeSection[] = [
    {
      key: "live",
      title: "Happening now",
      data: live.map((data) => ({ type: "live", data })),
    },
    {
      key: "recent",
      title: "Recent",
      data: recent.map((query) => ({ type: "recent", data: { query } })),
    },
    {
      key: "actions",
      title: "Quick actions",
      data: [{ type: "actions", data: QUICK_ACTIONS }],
    },
  ];
  return sections.filter((section) => section.data.length > 0);
}

export const searchHomeKey = (item: SearchHomeItem) => {
  switch (item.type) {
    case "live":
      return `live:${item.data.id}`;
    case "recent":
      return `recent:${item.data.query}`;
    case "actions":
      return "actions";
  }
};
