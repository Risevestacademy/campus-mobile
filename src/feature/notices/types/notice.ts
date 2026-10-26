export type NoticeKind = "deadline" | "event" | "resource" | "announcement";

export type NoticeFilter = "all" | "pinned" | "deadlines" | "events";

export type Notice = {
  id: string;
  kind: NoticeKind;
  title: string;
  subtitle: string;
  pinned: boolean;
  isNew: boolean;
  postedAt: string;
  /** Deadline notices: when the work is due. */
  dueAt?: string;
  /** Event notices: when the event starts. */
  startsAt?: string;
  /** Announcements that stop being relevant at this time. */
  endsAt?: string;
};
