import { ActivityToggle, Skeleton } from "@shared/components";
import { Avatar, StatusDot, Text } from "@shared/components/atoms";
import { useMe } from "@shared/hooks/useMe";
import { Status } from "@shared/lib/generated/world-protocol";
import {
  MessageCircleWarning,
  Navigation,
  Search,
  UserRound,
} from "lucide-react-native";
import { type LayoutChangeEvent, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

type CampusSummaryProps = {
  /** Undefined while there's no current count to show. */
  noOfParticipants?: number;
  location?: string;
};

const StyledNavigation = withUniwind(Navigation);
const StyledSearch = withUniwind(Search);
const StyledMessageCircleWarning = withUniwind(MessageCircleWarning);
const StyledUserRound = withUniwind(UserRound);

function peopleLabel(count: number) {
  return count === 1 ? "person" : "people";
}

function Summary({
  noOfParticipants,
  location,
  skeleton,
}: CampusSummaryProps & { skeleton: boolean }) {
  const count = (
    <Text variant="h3" className="text-action-accent">
      {noOfParticipants ?? 0} {peopleLabel(noOfParticipants ?? 0)} on campus now
    </Text>
  );

  return (
    <>
      <View className="items-start">
        {skeleton ? (
          <Skeleton isLoading={noOfParticipants === undefined} radius={16}>
            {count}
          </Skeleton>
        ) : (
          count
        )}
      </View>
      {location ? (
        <View className="flex-row items-center gap-1 pt-1">
          <StyledNavigation
            colorClassName="accent-text-turquoise-fixed"
            size={14}
          />
          <Text variant="body-sm" className="text-text-rail">
            You’re at {location}
          </Text>
        </View>
      ) : null}
    </>
  );
}

type CampusHeaderBarProps = CampusSummaryProps & {
  status?: Status;
  onStatusChange?: (status: Status) => void;
  scrollY: SharedValue<number>;
  /** Top of the page's count and location, within the scroll content. */
  summaryY: SharedValue<number>;
  /** 0 expanded → 1 collapsed, driven by scroll. */
  progress: SharedValue<number>;
  /** Past halfway: the compact count is shown, search and chat are not. */
  collapsed: boolean;
  onLayout?: (event: LayoutChangeEvent) => void;
};

/**
 * The pinned top row. As the page scrolls, a copy of the count and location
 * leaves the page, travels into the row's right side and settles there as a
 * person icon with the count and the location beneath; search and chat clear
 * out of its way.
 */
export function CampusHeaderBar({
  status,
  onStatusChange,
  noOfParticipants,
  location,
  scrollY,
  summaryY,
  progress,
  collapsed,
  onLayout,
}: CampusHeaderBarProps) {
  const { top } = useSafeAreaInsets();
  const { data: me, isLoading } = useMe();

  // Measured after layout; read on the UI thread to aim the flight.
  const barHeight = useSharedValue(0);
  const row = useSharedValue({ y: 0, width: 0, height: 0 });
  const compact = useSharedValue({ width: 0, height: 0 });

  // Nothing to fly while the count is loading: the page's skeleton stays.
  const ready = noOfParticipants !== undefined;
  // Reduce Motion: no travel or shrink. The page's count fades where it is
  // and the compact one fades in at its place in the bar.
  const reduceMotion = useReducedMotion();

  const displayName = me?.user.displayName ?? "";
  const imageUrl = me?.user.avatarUrl ?? "";

  const actionsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.4], [1, 0], Extrapolation.CLAMP),
  }));

  const flightStyle = useAnimatedStyle(() => {
    const p = progress.value;
    // Where the page's count is on screen right now…
    const fromY = barHeight.value + summaryY.value - scrollY.value;
    // …and where the compact count ends up: right of the row, centred on it.
    const toY = row.value.y + (row.value.height - compact.value.height) / 2;
    const t = reduceMotion ? 1 : p;
    return {
      opacity: ready && p > 0 ? 1 : 0,
      transform: [
        { translateX: t * (row.value.width - compact.value.width) },
        { translateY: fromY + (toY - fromY) * t },
      ],
    };
  });

  const fullStyle = useAnimatedStyle(() => {
    if (reduceMotion) return { opacity: 0 };
    return {
      opacity: interpolate(
        progress.value,
        [0, 0.6],
        [1, 0],
        Extrapolation.CLAMP,
      ),
      transform: [{ scale: 1 - 0.4 * progress.value }],
    };
  });

  const compactStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.4, 1], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <View
      onLayout={(event) => {
        barHeight.set(event.nativeEvent.layout.height);
        onLayout?.(event);
      }}
      className="absolute inset-x-0 top-0 z-10 bg-bg-band px-6"
      style={{ paddingTop: top + 16, paddingBottom: 8 }}
    >
      <View
        onLayout={(event) => {
          const { y, width, height } = event.nativeEvent.layout;
          row.set({ y, width, height });
        }}
        className="flex-row items-center gap-3"
      >
        <View className="relative overflow-visible">
          <Skeleton isLoading={isLoading} radius="round">
            <Avatar
              size={50}
              imageUrl={imageUrl}
              placeholder={displayName[0] ?? ""}
            />
          </Skeleton>
          <Skeleton isLoading={isLoading || !status} radius="round">
            <StatusDot
              status={status}
              className="absolute right-0 bottom-0 size-3 border-2 border-bg-band"
            />
          </Skeleton>
        </View>
        <View className="items-start gap-2">
          <Skeleton isLoading={isLoading} radius={16} width={200}>
            <Text variant="h6" className="text-[18px] text-text-on-dark">
              Hi, {me?.user.firstName}
            </Text>
          </Skeleton>
          <Skeleton isLoading={isLoading || !status} radius={16}>
            <ActivityToggle status={status} onChange={onStatusChange} />
          </Skeleton>
        </View>
        <Animated.View
          style={actionsStyle}
          className="flex grow flex-row gap-3"
          pointerEvents={collapsed ? "none" : "auto"}
          accessibilityElementsHidden={collapsed}
          importantForAccessibility={collapsed ? "no-hide-descendants" : "auto"}
          testID="campus-header-actions"
        >
          <IconOverlay>
            <StyledSearch size={20} colorClassName="accent-text-on-dark" />
          </IconOverlay>
          <IconOverlay>
            <StyledMessageCircleWarning
              size={20}
              colorClassName="accent-text-on-dark"
            />
          </IconOverlay>
        </Animated.View>
      </View>

      {/* The travelling copy, positioned from the bar's top-left corner. */}
      <Animated.View
        style={flightStyle}
        className="absolute top-0 left-6"
        pointerEvents="none"
      >
        <Animated.View
          style={[{ transformOrigin: "left top" }, fullStyle]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Summary
            noOfParticipants={noOfParticipants}
            location={location}
            skeleton={false}
          />
        </Animated.View>
        <Animated.View
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            compact.set({ width, height });
          }}
          style={compactStyle}
          className="absolute top-0 left-0 max-w-40 items-end gap-0.5"
          accessibilityElementsHidden={!collapsed}
          importantForAccessibility={collapsed ? "auto" : "no-hide-descendants"}
          testID="campus-header-compact"
        >
          <View
            className="flex-row items-center gap-1"
            accessible
            accessibilityLabel={`${noOfParticipants ?? 0} ${peopleLabel(noOfParticipants ?? 0)} on campus`}
          >
            <StyledUserRound colorClassName="accent-action-accent" size={14} />
            <Text variant="label" className="text-action-accent">
              {noOfParticipants ?? 0}
            </Text>
          </View>
          {location ? (
            <View className="flex-row items-center gap-1">
              <StyledNavigation
                colorClassName="accent-text-turquoise-fixed"
                size={12}
              />
              <Text
                variant="caption"
                className="shrink text-text-rail"
                numberOfLines={1}
              >
                {location}
              </Text>
            </View>
          ) : null}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

/**
 * The page part of the header: the count and location, with their skeleton.
 * Once the count is loaded and the page scrolls, the bar's travelling copy
 * stands in for them.
 */
export function CampusHeaderHero({
  noOfParticipants,
  location,
  progress,
  onLayout,
  onSummaryLayout,
}: CampusSummaryProps & {
  progress: SharedValue<number>;
  /** Its height sets how far the collapse runs. */
  onLayout?: (event: LayoutChangeEvent) => void;
  onSummaryLayout?: (event: LayoutChangeEvent) => void;
}) {
  const ready = noOfParticipants !== undefined;
  const reduceMotion = useReducedMotion();

  // Hands over to the bar's travelling copy, or with Reduce Motion fades out
  // in place, since nothing travels then.
  const summaryStyle = useAnimatedStyle(() => {
    if (!ready) return { opacity: 1 };
    if (reduceMotion) {
      return {
        opacity: interpolate(
          progress.value,
          [0, 0.5],
          [1, 0],
          Extrapolation.CLAMP,
        ),
      };
    }
    return { opacity: progress.value > 0 ? 0 : 1 };
  });

  return (
    <View onLayout={onLayout} className="bg-bg-band px-6 pt-7 pb-4">
      {/* Pulling down past the top shows band colour, not the page behind. */}
      <View className="absolute inset-x-0 -top-100 h-100 bg-bg-band" />
      {/* Measured: its top is where the travelling copy starts. */}
      <Animated.View
        onLayout={onSummaryLayout}
        style={summaryStyle}
        testID="campus-header-summary"
      >
        <Summary
          noOfParticipants={noOfParticipants}
          location={location}
          skeleton
        />
      </Animated.View>
    </View>
  );
}

const IconOverlay = ({
  children,
  badge,
}: {
  children: React.ReactNode;
  badge?: number;
}) => (
  <View className="size-11 items-center justify-center rounded-full bg-overlay-white-15">
    {children}

    {badge && (
      <View className="absolute -top-1 right-px h-4.5 items-center justify-center rounded-full bg-action-accent px-1">
        <Text variant="overline" className="text-text-on-accent">
          {badge}
        </Text>
      </View>
    )}
  </View>
);
