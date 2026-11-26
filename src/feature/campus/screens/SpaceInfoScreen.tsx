import { Back, LiveIndicator } from "@shared/components";
import {
  Button,
  MultiAvatar,
  Row,
  Spinner,
  Text,
  toast,
} from "@shared/components/atoms";
import SafeArea from "@shared/components/safearea/SafeArea";
import { CircleQuestionMark, Lock, Unlock } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import { withUniwind } from "uniwind";

import { useAskToJoin, useGoToSpace } from "../hooks";
import type { Space } from "../types";

const StyledCircleQuestionMark = withUniwind(CircleQuestionMark);
const StyledLock = withUniwind(Lock);
const StyledUnlock = withUniwind(Unlock);

/** How many faces show before the rest are counted. */
const FACES_SHOWN = 3;

type SpaceInfoScreenProps = {
  space: Space;
};

function describe(space: Space) {
  switch (space.status) {
    case "live":
      return `${space.meeting} is on now. Walk in to join.`;
    case "locked":
      return "Locked for a private session. Ask to join and anyone inside can let you in.";
    case "occupied":
      return "Open. Walk in and join the conversation.";
    case "empty":
      return "Nobody's here yet. Walk in and start something.";
  }
}

/**
 * "You and David", "Catherine, David and 3 others", "Just you". You lead the
 * list when you're there (see `toCampusSpaces`).
 */
function whoIsHere(people: string[], youAreHere: boolean) {
  if (people.length === 0) return "Nobody is here";
  if (youAreHere && people.length === 1) return "Just you";
  if (people.length <= 2) return people.join(" and ");
  const others = people.length - 2;
  return `${people[0]}, ${people[1]} and ${others} ${others === 1 ? "other" : "others"}`;
}

function AskToJoin({ space }: { space: Space }) {
  const { phase, reason, ask, withdraw } = useAskToJoin(space.key);

  return (
    <View className="gap-3">
      {phase === "waiting" ? (
        <>
          <Text color="secondary">
            Asked. Waiting for somebody inside to let you in…
          </Text>
          <Button variant="secondary" label="Withdraw" onPress={withdraw} />
        </>
      ) : phase === "entering" ? (
        <Text color="secondary">You&apos;re in. Walking through…</Text>
      ) : (
        <>
          {reason ? <Text color="secondary">{reason}</Text> : null}
          <Button
            label={phase === "ended" ? "Ask again" : "Ask to join"}
            loading={phase === "walking"}
            onPress={ask}
          />
          <Row gap="xs">
            <StyledCircleQuestionMark
              colorClassName="accent-text-secondary"
              size={14}
            />
            <Text color="secondary" variant="caption" className="flex-1">
              You&apos;ll walk to the door first. Anyone inside can let you in.
            </Text>
          </Row>
        </>
      )}
    </View>
  );
}

function GoThere({ space }: { space: Space }) {
  const { goToSpace, walkingTo } = useGoToSpace();

  return (
    <Button
      label={space.status === "live" ? "Join" : "Go there"}
      loading={walkingTo === space.key}
      onPress={() => {
        if (goToSpace(space.key, space.title)) {
          toast.success(`Walking to ${space.title}`);
        }
      }}
    />
  );
}

/** The dark band at the top: back, and whatever heads the page. */
function SpaceHeader({ children }: { children?: React.ReactNode }) {
  return (
    <View className="gap-2 bg-bg-band p-6 pt-safe-offset-3">
      <Back />
      {children}
    </View>
  );
}

/**
 * The space page before there's a space to show: world hasn't sent the map
 * yet (`ready` false), or the key isn't on it, e.g. an old link after an
 * admin republished the map. Same band as the page, so nothing jumps.
 */
export function SpaceInfoPlaceholder({ ready }: { ready: boolean }) {
  return (
    <SafeArea className="p-0" edges={[]}>
      <SpaceHeader />
      <View className="flex-1 items-center justify-center gap-2 p-6">
        {ready ? (
          <Text color="muted" className="text-center">
            This space isn&apos;t on the map any more.
          </Text>
        ) : (
          <>
            <Spinner size={20} />
            <Text variant="caption" color="muted">
              Campus is loading…
            </Text>
          </>
        )}
      </View>
    </SafeArea>
  );
}

export function SpaceInfoScreen({ space }: SpaceInfoScreenProps) {
  const locked = space.status === "locked";
  const Icon = locked ? StyledLock : StyledUnlock;

  return (
    <SafeArea className="p-0" edges={[]}>
      <SpaceHeader>
        <Row gap="sm">
          <Text variant="h1" className="shrink text-text-on-dark">
            {space.title}
          </Text>
          <Icon
            size={16}
            colorClassName="accent-text-on-dark"
            accessibilityLabel={locked ? "Locked" : "Open"}
          />
          {space.status === "live" ? <LiveIndicator /> : null}
        </Row>
        <Text className="text-text-on-dark opacity-80">{describe(space)}</Text>
        {/* As wide as its content, not the band: a pill. */}
        <Row
          gap="sm"
          className="max-w-full self-start rounded-full bg-overlay-white-15/90 px-2 py-1"
        >
          {space.people.length > 0 ? (
            <MultiAvatar
              size={28}
              max={FACES_SHOWN}
              ringClassName="border-overlay-white-15/90"
              participants={space.people.map((name, index) => ({
                id: `${name}:${index}`,
                placeholder: name.slice(0, 1).toUpperCase(),
              }))}
            />
          ) : null}
          <Text variant="body-sm" className="shrink">
            {whoIsHere(space.people, space.youAreHere)}
          </Text>
        </Row>
      </SpaceHeader>
      <View className="flex-1 p-6">
        <View className="flex-1" />
        {locked ? <AskToJoin space={space} /> : <GoThere space={space} />}
      </View>
    </SafeArea>
  );
}
