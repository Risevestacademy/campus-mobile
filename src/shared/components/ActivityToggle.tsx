import { BottomSheetModal, useBottomSheet } from "@gorhom/bottom-sheet";
import { StatusDot, Text } from "@shared/components/atoms";
import { ActivityStatus } from "@shared/types";
import { cn } from "@shared/utils/style";
import { Check, ChevronRight, Clock } from "lucide-react-native";
import { CaretDownIcon } from "phosphor-react-native";
import { useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { withUniwind } from "uniwind";

import { BottomSheet } from "./BottomSheet";

const options: {
  short: string;
  long: string;
  status: ActivityStatus;
  description: string;
}[] = [
  {
    short: "Available",
    long: "Available",
    status: "available",
    description: "Waves, messages and nearby audio come through",
  },
  {
    short: "Busy",
    long: "Busy",
    status: "busy",
    description: "Messages only. Nearby audio stays off",
  },
  {
    short: "Away",
    long: "Away",
    status: "away",
    description: "You show as away. Calls go to messages",
  },
] as const;

type ClearAfter = "never" | "30m" | "1h" | "2h" | "4h" | "today";

const CLEAR_AFTER: { key: ClearAfter; label: string }[] = [
  { key: "never", label: "Don't clear" },
  { key: "30m", label: "30 minutes" },
  { key: "1h", label: "1 hour" },
  { key: "2h", label: "2 hours" },
  { key: "4h", label: "4 hours" },
  { key: "today", label: "Today" },
];

const HOUR = 60 * 60;

/** How long to keep a status, for `setStatus`; undefined keeps it for good. */
export function clearAfterSeconds(
  key: ClearAfter,
  now = new Date(),
): number | undefined {
  switch (key) {
    case "never":
      return undefined;
    case "30m":
      return HOUR / 2;
    case "1h":
      return HOUR;
    case "2h":
      return 2 * HOUR;
    case "4h":
      return 4 * HOUR;
    case "today": {
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      return Math.max(60, Math.round((+midnight - +now) / 1000));
    }
  }
}

const labelOf = (key: ClearAfter) =>
  CLEAR_AFTER.find((option) => option.key === key)?.label ?? "";

/** "3:00 PM", or the device's own clock format. */
function formatUntil(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

const StyledChevronDown = withUniwind(CaretDownIcon);
const StyledCheck = withUniwind(Check);
const StyledChevronRight = withUniwind(ChevronRight);
const StyledClock = withUniwind(Clock);

type ActivityToggleProps = {
  status?: ActivityStatus;
  until?: string | null;
  onChange?: (status: ActivityStatus, forSeconds?: number) => void;
  containerClassName?: string;
  textClassName?: string;
  iconColorClassName?: string;
};

export function ActivityToggle({
  status,
  until,
  onChange,
  containerClassName,
  textClassName,
  iconColorClassName = "accent-text-on-dark",
}: ActivityToggleProps) {
  const selectedOption = options.find((e) => e.status === status);

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const clearAfterSheetRef = useRef<BottomSheetModal>(null);
  const [clearAfter, setClearAfter] = useState<ClearAfter>("never");
  const show = () => bottomSheetRef.current?.present();

  const select = (next: ActivityStatus) => {
    const forSeconds = clearAfterSeconds(clearAfter);
    if (next !== status || forSeconds) onChange?.(next, forSeconds);
    bottomSheetRef.current?.dismiss();
  };

  return (
    <>
      <Pressable
        className={cn(
          "flex-row items-center gap-1 rounded-full bg-overlay-white-15 px-3 py-0.5",
          containerClassName,
        )}
        onPress={show}
        disabled={!status}
      >
        <StatusDot status={selectedOption?.status} />
        <Text
          className={cn("text-text-on-dark", textClassName)}
          variant="label"
        >
          {selectedOption?.short}
          {until ? ` · until ${formatUntil(until)}` : ""}
        </Text>
        <StyledChevronDown
          colorClassName={iconColorClassName}
          size={10}
          weight="bold"
        />
      </Pressable>
      <BottomSheet ref={bottomSheetRef}>
        <View className="gap-2">
          <Text variant="h5">How reachable are you?</Text>
          <Text variant="body-sm" color="secondary">
            Where you are updates on its own. This sets who can reach you.
          </Text>
        </View>
        <ActivitySelector onSelect={select} selected={status} />
        <View className="flex-row items-center justify-between">
          <Text>Clear after</Text>
          <Pressable
            className="flex-row items-center gap-1"
            onPress={() => clearAfterSheetRef.current?.present()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={`Clear after: ${labelOf(clearAfter)}`}
          >
            <Text color="link" variant="body-sm">
              {labelOf(clearAfter)}
            </Text>
            <StyledChevronRight colorClassName="accent-text-link" size={16} />
          </Pressable>
        </View>
        <View className="flex-row justify-start gap-2">
          <StyledClock
            size={14}
            colorClassName="accent-text-muted"
            strokeWidth={1}
          />
          <Text variant="caption" color="secondary">
            If Campus is in the background, or there are no taps or mic activity
            for 5 min, you’ll show as Idle.
          </Text>
        </View>
      </BottomSheet>
      <ClearAfterSheet
        ref={clearAfterSheetRef}
        selected={clearAfter}
        onSelect={setClearAfter}
      />
    </>
  );
}

function ClearAfterOption({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const { close } = useBottomSheet();
  return (
    <Pressable
      onPress={() => {
        onSelect();
        close();
      }}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className={cn(
        "flex-row items-center justify-between rounded-lg px-3 py-3 active:bg-bg-hover",
        selected && "bg-bg-hover",
      )}
    >
      <Text variant="body-sm">{label}</Text>
      {selected && (
        <StyledCheck size={16} colorClassName="accent-action-primary" />
      )}
    </Pressable>
  );
}

const ClearAfterSheet = ({
  ref,
  selected,
  onSelect,
}: {
  ref: React.Ref<BottomSheetModal>;
  selected: ClearAfter;
  onSelect: (key: ClearAfter) => void;
}) => (
  <BottomSheet ref={ref} stackBehavior="push" contentClassName="gap-0">
    <Text variant="h5" className="mb-3">
      Clear after
    </Text>
    {CLEAR_AFTER.map((option) => (
      <ClearAfterOption
        key={option.key}
        label={option.label}
        selected={option.key === selected}
        onSelect={() => onSelect(option.key)}
      />
    ))}
  </BottomSheet>
);

function ActivitySelector({
  onSelect,
  selected,
}: {
  onSelect?: (a: ActivityStatus) => void;
  selected?: ActivityStatus;
}) {
  return (
    <View className="gap-2">
      {options.map((e, i) => (
        <Pressable
          key={i}
          className={cn(
            "flex-row items-center gap-3 rounded-lg p-3",
            selected === e.status
              ? "border-[0.5px] border-status-success"
              : "bg-bg-raised-cool",
          )}
          onPress={() => {
            if (!onSelect) return;
            onSelect(e.status);
          }}
        >
          <StatusDot status={e.status} />
          <View className="flex-1 gap-0.5">
            <Text variant="label" color="primary">
              {e.long}
            </Text>
            <Text variant="caption" color="secondary">
              {e.description}
            </Text>
          </View>
          <View
            className={cn(
              "size-5 rounded-full border",
              selected === e.status
                ? "border-[6px] border-status-success"
                : "border-border-strong",
            )}
          />
        </Pressable>
      ))}
    </View>
  );
}
