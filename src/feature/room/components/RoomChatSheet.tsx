import {
  BottomSheetFlatList,
  type BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { BottomSheet } from "@shared/components";
import { Text, TextField } from "@shared/components/atoms";
import { cn } from "@shared/utils/style";
import { useChatStore } from "@store/chat";
import { Send } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

import { type ChatMessage, MAX_CHAT_LENGTH, useRoomChat } from "../hooks";

const StyledSend = withUniwind(Send);
const SNAP_POINTS = ["75%"];

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function Bubble({ message }: { message: ChatMessage }) {
  const mine = message.isLocal;
  return (
    <View className={cn("max-w-[80%] gap-1", mine ? "self-end" : "self-start")}>
      {!mine && (
        <Text variant="caption" color="muted" numberOfLines={1}>
          {message.name}
        </Text>
      )}
      <View
        className={cn(
          "rounded-2xl px-4 py-3",
          mine ? "bg-action-primary" : "bg-bg-hover",
        )}
      >
        <Text color={mine ? "inverse" : "primary"}>{message.text}</Text>
      </View>
      <Text
        variant="caption"
        color="muted"
        className={mine ? "text-right" : "text-left"}
      >
        {formatTime(message.timestamp)}
      </Text>
    </View>
  );
}

/** The space's group chat: a headerless sheet of bubbles and an input. */
export function RoomChatSheet() {
  const open = useChatStore((state) => state.open);
  const { messages, send, connected } = useRoomChat();
  const { bottom } = useSafeAreaInsets();
  const ref = React.useRef<BottomSheetModal>(null);
  // Negative while the keyboard is up. The sheet sits on the bottom edge, so
  // padding by the keyboard's height lifts the input above it. (gorhom's own
  // handling and keyboard-controller's KeyboardAvoidingView both miss here:
  // the first listens to events the root KeyboardProvider replaces, the
  // second measures its frame inside an animating sheet.)
  const keyboard = useReanimatedKeyboardAnimation();
  const lift = useAnimatedStyle(() => ({
    flex: 1,
    // The footer already pads for the home indicator; the keyboard covers it.
    paddingBottom: Math.max(-keyboard.height.value - bottom, 0),
  }));
  const [draft, setDraft] = React.useState("");

  // Newest first, for the inverted list.
  const data = React.useMemo(() => [...messages].reverse(), [messages]);
  const canSend = connected && draft.trim() !== "";

  // gorhom gets stuck "dismissing" if dismiss() is called on a modal that
  // isn't showing (never presented, or already closed by a swipe or the back
  // button, which reports through onDismiss). The next present() then never
  // shows it. So only dismiss a sheet this effect presented and nobody closed.
  const presented = React.useRef(false);
  React.useEffect(() => {
    if (open) {
      presented.current = true;
      ref.current?.present();
    } else if (presented.current) {
      presented.current = false;
      ref.current?.dismiss();
    }
  }, [open]);

  const submit = () => {
    if (!canSend) return;
    // Clear only once it has gone; a refused send keeps the text.
    if (send(draft)) setDraft("");
  };

  return (
    <BottomSheet
      ref={ref}
      bare
      snapPoints={SNAP_POINTS}
      enableDynamicSizing={false}
      // Only the handle drags the sheet. With content panning on, pulling
      // down on the newest message (the top of an inverted list) closes the
      // sheet instead of scrolling to older ones.
      enableContentPanningGesture={false}
      enableOverDrag={false}
      enableBlurKeyboardOnGesture
      onDismiss={() => {
        presented.current = false;
        setDraft("");
        useChatStore.getState().setOpen(false);
      }}
    >
      <Animated.View style={lift}>
        <BottomSheetFlatList
          inverted
          data={data}
          keyExtractor={(m: ChatMessage) => m.id}
          renderItem={({ item }: { item: ChatMessage }) => (
            <Bubble message={item} />
          )}
          contentContainerClassName="gap-3 px-6 py-4"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        />
        <View
          className="flex-row items-center gap-3 border-t border-border-default px-6 pt-3"
          style={{ paddingBottom: bottom + 8 }}
        >
          <TextField
            containerClassName="flex-1"
            placeholder="Message everyone"
            value={draft}
            onChangeText={setDraft}
            maxLength={MAX_CHAT_LENGTH}
            multiline
            // About three lines, then the text scrolls inside the field.
            inputClassName="max-h-20"
            returnKeyType="send"
            disabled={!connected}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send message"
            accessibilityState={{ disabled: !canSend }}
            disabled={!canSend}
            onPress={submit}
            className={cn(
              "size-11 items-center justify-center rounded-full bg-action-primary",
              !canSend && "opacity-40",
            )}
          >
            <StyledSend colorClassName="accent-text-inverse" size={18} />
          </Pressable>
        </View>
      </Animated.View>
    </BottomSheet>
  );
}
