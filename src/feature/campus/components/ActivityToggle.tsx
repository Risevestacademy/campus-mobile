import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheet } from "@shared/components";
import { StatusDot, Text } from "@shared/components/atoms";
import { ActivityStatus } from "@shared/types";
import { cn } from "@shared/utils/style";
import { ChevronRight, Clock } from "lucide-react-native";
import { CaretDownIcon } from "phosphor-react-native";
import React, { useRef } from "react";
import { Pressable, View } from "react-native";
import { withUniwind } from "uniwind";

const options = [
  {
    short: "Available",
    long: "Available",
    status: "online",
    description: "Waves, messages and nearby audio come through",
  },
  {
    short: "Busy",
    long: "Busy",
    status: "busy",
    description: "Messages only. Nearby audio stays off",
  },
  {
    short: "Offline",
    long: "Do not disturb",
    status: "offline",
    description: "Nothing comes through until you switch back",
  },
  {
    short: "Away",
    long: "Away",
    status: "away",
    description: "You show as away. Calls go to messages",
  },
] as const;

const StyledChevronDown = withUniwind(CaretDownIcon);
const StyledChevronRight = withUniwind(ChevronRight);
const StyledClock = withUniwind(Clock);

export function ActivityToggle() {
  const [activity, setActivity] = React.useState<ActivityStatus>("online");
  const selectedOption = options.find((e) => e.status === activity);

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const show = () => bottomSheetRef.current?.present();

  const select = (status: ActivityStatus) => {
    setActivity(status);
    bottomSheetRef.current?.dismiss();
  };

  return (
    <>
      <Pressable
        className="flex-row items-center gap-1 rounded-full bg-overlay-white-15 px-3 py-0.5"
        onPress={show}
      >
        <StatusDot status={selectedOption?.status} />
        <Text className="text-text-on-dark" variant="label">
          {selectedOption?.short}
        </Text>
        <StyledChevronDown
          colorClassName="accent-text-on-dark"
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
        <ActivitySelector onSelect={select} selected={activity} />
        <View className="flex-row items-center justify-between">
          <Text>Clear after</Text>
          <Pressable className="flex-row items-center gap-1">
            <Text color="link" variant="body-sm">
              1 hour
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
    </>
  );
}

function ActivitySelector({
  onSelect,
  selected = "online",
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
