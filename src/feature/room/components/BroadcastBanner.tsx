import { LiveIndicator } from "@shared/components";
import { Text, toast } from "@shared/components/atoms";
import { formatParticipantPresentation } from "@shared/helpers";
import { cn } from "@shared/utils/style";
import { useWorldStore } from "@store/world";
import { Megaphone, MicOff } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";
import { useShallow } from "zustand/react/shallow";

import { useBroadcastStore } from "../store/broadcast";

const StyledMegaphone = withUniwind(Megaphone);
const StyledMicOff = withUniwind(MicOff);

/** Who is broadcasting, by name; "An admin" for anybody world hasn't named. */
function useSpeakerNames(userIds: string[]) {
  return useWorldStore(
    useShallow((state) =>
      userIds.map((id) => state.players[id]?.displayName ?? "An admin"),
    ),
  );
}

/**
 * Floats over every screen while somebody broadcasts to the campus, saying
 * who. A broadcast can't be muted, so there's nothing to tap for listeners.
 * Admins also get a button here to start and end their own broadcast.
 */
export function BroadcastBanner() {
  const { top } = useSafeAreaInsets();
  const { room, canSpeak, speakers, speaking } = useBroadcastStore(
    useShallow((state) => ({
      room: state.room,
      canSpeak: state.canSpeak,
      speakers: state.speakers,
      speaking: state.speaking,
    })),
  );
  const names = useSpeakerNames(speakers);
  const [busy, setBusy] = React.useState(false);

  const live = speakers.length > 0 || speaking;
  if (!room || (!live && !canSpeak)) return null;

  const toggleBroadcast = async () => {
    setBusy(true);
    try {
      await room.localParticipant.setMicrophoneEnabled(!speaking);
    } catch (error) {
      if (__DEV__) console.warn("[broadcast]", error);
      toast.error(
        "Allow Campus to use your microphone in Settings to broadcast.",
        "Can't broadcast",
      );
    } finally {
      setBusy(false);
    }
  };

  const who = speaking
    ? formatParticipantPresentation(["You", ...names])
    : formatParticipantPresentation(names);

  return (
    <View
      pointerEvents="box-none"
      className="absolute inset-x-0 items-center"
      style={{ top: top + 8 }}
    >
      <View
        className="flex-row items-center gap-2 rounded-full bg-bg-ink-card py-1.5 pr-1.5 pl-3"
        // For listeners the banner is one thing to read; for an admin its
        // text and button are read separately, so the button keeps its name.
        accessible={!canSpeak}
        accessibilityRole={canSpeak ? undefined : "text"}
        accessibilityLabel={
          canSpeak ? undefined : `Broadcasting to campus: ${who}`
        }
        testID="broadcast-banner"
      >
        {live ? (
          <>
            <LiveIndicator />
            <Text
              variant="label"
              numberOfLines={1}
              className="max-w-52 text-text-on-dark"
            >
              {who}
            </Text>
          </>
        ) : (
          <StyledMegaphone size={14} colorClassName="accent-text-on-dark" />
        )}
        {canSpeak ? (
          <Pressable
            onPress={() => void toggleBroadcast()}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={
              speaking ? "End your broadcast" : "Broadcast to campus"
            }
            accessibilityState={{ busy, disabled: busy }}
            className={cn(
              "flex-row items-center gap-1 rounded-full px-3 py-1",
              speaking ? "bg-status-live" : "bg-action-primary",
              busy && "opacity-60",
            )}
          >
            {speaking ? (
              <StyledMicOff size={12} colorClassName="accent-text-on-dark" />
            ) : null}
            <Text variant="label" className="text-text-on-dark">
              {speaking ? "End" : "Broadcast"}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
