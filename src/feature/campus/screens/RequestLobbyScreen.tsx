import { Button, Spinner, Text } from "@shared/components/atoms";
import SafeArea from "@shared/components/safearea/SafeArea";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

import { LobbyDesign } from "../components/LobbyDesign";
import { useAskToJoin } from "../hooks/useAskToJoin";
import { useWhenRequestGone } from "../hooks/useWhenRequestGone";

/** The pill heading the lobby: a spinner while you wait. */
function RequestPill({ label, busy }: { label: string; busy: boolean }) {
  return (
    <View className="flex-row items-center gap-2 rounded-full bg-action-accent px-3 py-1">
      {busy ? (
        <Spinner size={14} colorClassName="accent-text-on-accent" />
      ) : null}
      <Text variant="label" className="text-text-on-accent">
        {label}
      </Text>
    </View>
  );
}

/**
 * Where you wait after asking to enter a locked space. Leaving is fine: the
 * request stays open and its answer pings you wherever you are. Cancel
 * withdraws it, as soon as world has it.
 */
export function RequestLobbyScreen({
  spaceKey,
  spaceName,
}: {
  spaceKey: string;
  spaceName: string;
}) {
  const router = useRouter();
  const { phase, reason, cancel } = useAskToJoin(spaceKey, spaceName);
  // Set when you leave on purpose, so the request ending after doesn't
  // navigate a second time.
  const leaving = React.useRef(false);

  // Let in and walked through, or withdrawn elsewhere: nothing to wait for.
  useWhenRequestGone(spaceKey, () => {
    if (!leaving.current) router.back();
  });

  const backToCampus = () => {
    leaving.current = true;
    router.dismissTo("/(app)/(tabs)/(campus)");
  };

  const cancelRequest = () => {
    leaving.current = true;
    cancel();
    router.back();
  };

  const ended = phase === "ended";
  const entering = phase === "entering";

  return (
    <SafeArea className="bg-bg-band px-6">
      <View className="flex-1 items-center justify-center gap-5">
        <View className="mb-6">
          <LobbyDesign animate={!ended && !entering} />
        </View>
        <RequestPill
          label={ended ? "Request ended" : entering ? "Let in" : "Request sent"}
          busy={!ended && !entering}
        />
        <Text variant="h1" className="text-center text-text-on-dark">
          {ended
            ? "You weren't let in"
            : entering
              ? `Walking you into ${spaceName}`
              : "Waiting for host to let you in"}
        </Text>
        <Text
          variant="body-md"
          className="text-center text-text-rail opacity-80"
        >
          {ended
            ? reason
            : "You can leave this screen. We’ll ping you the moment they answer."}
        </Text>
      </View>
      <View className="gap-3 pb-4">
        <Button
          className="bg-bg-on-colour active:bg-bg-on-colour"
          labelClassName="text-text-on-accent"
          label="Back to campus"
          onPress={backToCampus}
        />
        <Button
          variant="tertiary"
          label={ended ? "Close" : "Cancel request"}
          onPress={cancelRequest}
        />
      </View>
    </SafeArea>
  );
}
