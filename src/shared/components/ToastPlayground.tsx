import { Pressable, View } from "react-native";

import { Text, toast } from "./atoms";

// Confirms a button press reached its handler.
const log = (what: string) => () => toast.success(`Pressed ${what}`);

/** Dev only: fires each toast type, to check how they look. */
const SAMPLES: { label: string; show: () => void }[] = [
  { label: "Error", show: () => toast.error("Couldn't reach campus.") },
  {
    label: "Success",
    show: () =>
      toast.success("Status updated", { text: "Undo", onPress: log("undo") }),
  },
  {
    label: "Wave",
    show: () =>
      toast.wave({
        name: "Ada",
        space: "Library",
        sentAt: new Date(),
        onWaveBack: log("wave back"),
      }),
  },
  {
    label: "Message",
    show: () =>
      toast.message({
        name: "Bo",
        text: "Coffee after class?",
        onReply: log("reply"),
      }),
  },
  {
    label: "Class",
    show: () =>
      toast.classStarting({
        name: "Design Systems",
        when: "in 5 min",
        location: "Studio",
        onJoin: log("join"),
      }),
  },
  {
    label: "Entry",
    show: () =>
      toast.entryRequest({
        name: "Cy",
        space: "Library",
        onAccept: log("let in"),
        onDecline: log("decline"),
      }),
  },
  {
    label: "Notice",
    show: () =>
      toast.notice({
        title: "Calendar synced",
        message: "3 new events this week.",
        action: { text: "View", onPress: log("view") },
      }),
  },
  {
    label: "System",
    show: () =>
      toast.system({ title: "Update ready", message: "Restart to apply." }),
  },
];

export function ToastPlayground() {
  if (!__DEV__) return null;

  return (
    <View className="mx-6 flex-row flex-wrap gap-2">
      {SAMPLES.map(({ label, show }) => (
        <Pressable
          key={label}
          onPress={show}
          accessibilityRole="button"
          className="rounded-full bg-bg-ink-card px-3 py-1.5"
        >
          <Text variant="label" className="text-text-on-dark">
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
