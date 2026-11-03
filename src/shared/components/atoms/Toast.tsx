import { cn } from "@shared/utils/style";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Bell,
  Check,
  ChevronRight,
  CircleAlert,
  Info,
  type LucideIcon,
  Video,
} from "lucide-react-native";
import { createContext, type ReactNode, use } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RNDefaultToast, {
  type ToastConfig,
  type ToastConfigParams,
  type ToastProps as RNToastProps,
} from "react-native-toast-message";
import { useCSSVariable, withUniwind } from "uniwind";

import { Avatar } from "./Avatar";
import { Card } from "./Card";
import { hidePill, showPill, useFeedbackPill } from "./feedbackPill";
import { Row } from "./Row";
import { Text } from "./Text";
import { createToastQueue, useWaitingCount } from "./toastQueue";

const StyledCircleAlert = withUniwind(CircleAlert);
const StyledCheck = withUniwind(Check);
const StyledChevronRight = withUniwind(ChevronRight);

type Tone = "danger" | "info" | "success" | "neutral";

/** Colour per tone; the layout comes from the variant. */
const TONES: Record<
  Tone,
  { card: string; title: string; subtitle: string; bar: string }
> = {
  danger: {
    card: "border-status-danger-border bg-bg-card",
    title: "text-text-primary",
    subtitle: "text-text-secondary",
    bar: "bg-status-danger",
  },
  info: {
    card: "border-action-accent bg-bg-tint-sky-card",
    title: "text-text-sky",
    subtitle: "text-text-sky",
    bar: "bg-text-sky",
  },
  success: {
    card: "border-status-success bg-status-success-subtle",
    title: "text-text-success",
    subtitle: "text-text-success",
    bar: "bg-status-success",
  },
  neutral: {
    card: "border-border-default bg-bg-card",
    title: "text-text-primary",
    subtitle: "text-text-secondary",
    bar: "bg-action-primary",
  },
};

type ToastAction = { text: string; onPress: () => void };

type CardContent = {
  tone?: Tone;
  title: string;
  subtitle?: string;
  prefix?: ReactNode;
  /** Tapping the card runs this, then dismisses it. */
  onPress?: () => void;
};

/** How the toast being shown behaves, set by `show` for its type. */
type ToastDisplay = {
  /** New per toast, so the countdown restarts when one replaces another. */
  id: number;
  /** Shows a countdown bar running out over this long. */
  countdownMs?: number;
  /** A tap dismisses it even with nothing to open. */
  tapToDismiss: boolean;
};

const ToastDisplayContext = createContext<ToastDisplay>({
  id: 0,
  tapToDismiss: false,
});

export type ToastShellProps =
  | { variant: "feedback"; title: string; action?: ToastAction }
  | ({ variant: "system" } & CardContent)
  | ({ variant: "notice"; action?: ToastAction } & CardContent)
  | ({ variant: "action"; suffix?: ReactNode } & CardContent)
  | ({
      variant: "prompt";
      primary: ToastAction;
      secondary: ToastAction;
    } & CardContent);

/** The one layout every toast is built from. */
export function ToastShell(props: ToastShellProps) {
  const display = use(ToastDisplayContext);
  const waiting = useWaitingCount();

  if (props.variant === "feedback") {
    return (
      <Row className="mx-4 my-2 self-center rounded-full bg-bg-selected px-4 py-2.5 shadow-md">
        <StyledCheck size={14} colorClassName="accent-text-on-dark" />
        <Text variant="label" className="shrink text-text-on-dark">
          {props.title}
        </Text>
        {props.action ? (
          <Text
            variant="label"
            className="text-action-accent"
            accessibilityRole="button"
            onPress={props.action.onPress}
          >
            {props.action.text}
          </Text>
        ) : null}
      </Row>
    );
  }

  const tone = TONES[props.tone ?? "neutral"];
  const open = props.onPress
    ? dismissing(props.onPress)
    : display.tapToDismiss
      ? () => void RNDefaultToast.hide()
      : undefined;

  return (
    <View className="mx-4 my-2 gap-1.5 self-stretch">
      <Card
        variant={"elevated"}
        onPress={open}
        className={cn("gap-3 overflow-hidden rounded-xl", tone.card)}
      >
        <Row gap="md">
          {props.prefix}
          <View className="flex-1 gap-0.5">
            <Text variant="label" className={tone.title}>
              {props.title}
            </Text>
            {props.subtitle ? (
              <Text variant="body-sm" className={tone.subtitle}>
                {props.subtitle}
              </Text>
            ) : null}
          </View>
          {props.variant === "action" ? props.suffix : null}
          {props.variant === "notice" && props.action ? (
            <ChevronAction
              label={props.action.text}
              onPress={props.action.onPress}
            />
          ) : null}
        </Row>
        {props.variant === "prompt" ? (
          <Row>
            <ActionButton type="secondary" {...props.secondary} />
            <ActionButton type="primary" {...props.primary} />
          </Row>
        ) : null}
        {display.countdownMs ? (
          <CountdownBar
            key={display.id}
            durationMs={display.countdownMs}
            className={tone.bar}
          />
        ) : null}
      </Card>
      {waiting > 0 ? (
        <View className="self-end rounded-full bg-bg-selected px-3 py-1 shadow-md">
          <Text variant="caption" className="text-text-on-dark">
            +{waiting} more
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/** Runs out along the card's bottom edge as the toast's time does. */
function CountdownBar({
  durationMs,
  className,
}: {
  durationMs: number;
  className: string;
}) {
  return (
    <Animated.View
      testID="toast-countdown"
      className={cn("absolute inset-x-0 bottom-0 h-0.5", className)}
      style={{
        transformOrigin: "left",
        animationName: {
          from: { transform: [{ scaleX: 1 }] },
          to: { transform: [{ scaleX: 0 }] },
        },
        animationDuration: `${durationMs}ms`,
        animationTimingFunction: "linear",
        animationFillMode: "forwards",
      }}
    />
  );
}

const actionButtonVariants = cva(
  "items-center justify-center rounded-full px-3 py-2",
  {
    variants: {
      // Share the row with the other button, or size to the label.
      fill: { true: "flex-1", false: "" },
      type: {
        secondary: "bg-bg-raised-cool",
        primary: "bg-action-primary",
      },
    },
    defaultVariants: { type: "primary", fill: true },
  },
);

const actionTextVariants = cva("", {
  variants: {
    type: {
      secondary: "text-text-primary",
      primary: "text-text-on-dark",
    },
  },
  defaultVariants: { type: "primary" },
});

function ActionButton({
  text,
  onPress,
  type,
  fill,
}: ToastAction & VariantProps<typeof actionButtonVariants>) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      className={actionButtonVariants({ type, fill })}
    >
      <Text variant="label" className={actionTextVariants({ type })}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}

type ToastPerson = { name: string; imageUrl?: string };

/** "09:05", as times read elsewhere in the app. */
function formatClock(date: Date) {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/** What each toast type is shown with. Add a type here, then render it below. */
export type ToastParams = {
  error: { title: string; message: string };
  wave: ToastPerson & {
    /** Where they waved from. */
    space: string;
    sentAt: Date;
    onWaveBack: () => void;
    /** Tapping the toast, e.g. to open their profile. */
    onOpen?: () => void;
  };
  message: ToastPerson & {
    text: string;
    onReply: () => void;
    /** Tapping the toast; defaults to `onReply`. */
    onOpen?: () => void;
  };
  classStarting: {
    name: string;
    /** When it starts, e.g. "in 5 min". */
    when: string;
    location?: string;
    onJoin: () => void;
  };
  entryRequest: ToastPerson & {
    space: string;
    onAccept: () => void;
    onDecline: () => void;
  };
  notice: {
    title: string;
    message?: string;
    action?: ToastAction;
    /** Defaults to a bell. */
    icon?: LucideIcon;
    /** Tapping the toast; defaults to `action`. */
    onOpen?: () => void;
  };
  system: {
    title: string;
    message?: string;
    /** Defaults to an info circle. */
    icon?: LucideIcon;
    onOpen?: () => void;
  };
};

type ToastType = keyof ToastParams;

type ShownToast<T extends ToastType> = {
  params: ToastParams[T];
  display: ToastDisplay;
};

function render<T extends ToastType>(
  renderer: (params: ToastParams[T]) => ReactNode,
) {
  return function ToastWithDisplay({
    props,
  }: ToastConfigParams<ShownToast<T>>) {
    // Before the first toast the host renders a default type with no props.
    if (!props.params) return null;
    return (
      <ToastDisplayContext value={props.display}>
        {renderer(props.params)}
      </ToastDisplayContext>
    );
  };
}

/** Runs `onPress`, then dismisses the toast it was pressed on. */
function dismissing(onPress: () => void) {
  return () => {
    onPress();
    void RNDefaultToast.hide();
  };
}

function withDismiss(action: ToastAction): ToastAction;
function withDismiss(action?: ToastAction): ToastAction | undefined;
function withDismiss(action?: ToastAction) {
  return action && { ...action, onPress: dismissing(action.onPress) };
}

/** A chevron at the end of a toast that opens what it's about. */
function ChevronAction({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <StyledChevronRight size={16} colorClassName="accent-text-secondary" />
    </TouchableOpacity>
  );
}

/** A toast's icon on a rounded square, in the same spot as an avatar. */
function IconTile({
  icon: Icon,
  className,
  iconColor,
}: {
  icon: LucideIcon;
  className: string;
  iconColor: `--color-${string}`;
}) {
  const color = useCSSVariable(iconColor) as string;
  return (
    <View
      className={cn("size-9 items-center justify-center rounded-lg", className)}
    >
      <Icon size={18} color={color} />
    </View>
  );
}

function PersonAvatar({ name, imageUrl }: ToastPerson) {
  return <Avatar size={36} imageUrl={imageUrl} placeholder={name[0] ?? ""} />;
}

const toastConfig = {
  error: render<"error">(({ title, message }) => (
    <ToastShell
      variant="system"
      tone="danger"
      title={title}
      subtitle={message}
      prefix={
        <StyledCircleAlert size={22} colorClassName="accent-status-danger" />
      }
    />
  )),
  wave: render<"wave">(
    ({ name, imageUrl, space, sentAt, onWaveBack, onOpen }) => (
      <ToastShell
        variant="action"
        onPress={onOpen}
        title={`${name} waved at you`}
        subtitle={`${space} · ${formatClock(sentAt)}`}
        prefix={<PersonAvatar name={name} imageUrl={imageUrl} />}
        suffix={
          <ActionButton
            text="Wave back"
            fill={false}
            onPress={dismissing(onWaveBack)}
          />
        }
      />
    ),
  ),
  message: render<"message">(
    ({ name, imageUrl, text, onReply, onOpen = onReply }) => (
      <ToastShell
        variant="action"
        onPress={onOpen}
        title={name}
        subtitle={text}
        prefix={<PersonAvatar name={name} imageUrl={imageUrl} />}
        suffix={
          <ChevronAction
            label={`Reply to ${name}`}
            onPress={dismissing(onReply)}
          />
        }
      />
    ),
  ),
  classStarting: render<"classStarting">(({ name, when, location, onJoin }) => (
    <ToastShell
      variant="prompt"
      tone="info"
      title={`${name} starts ${when}`}
      subtitle={location}
      prefix={
        <IconTile
          icon={Video}
          className="bg-bg-tint-lemon"
          iconColor="--color-text-lemon"
        />
      }
      primary={{ text: "Join", onPress: dismissing(onJoin) }}
      secondary={{ text: "Dismiss", onPress: () => void RNDefaultToast.hide() }}
    />
  )),
  entryRequest: render<"entryRequest">(
    ({ name, imageUrl, space, onAccept, onDecline }) => (
      <ToastShell
        variant="prompt"
        title={`${name} wants to join`}
        subtitle={space}
        prefix={<PersonAvatar name={name} imageUrl={imageUrl} />}
        primary={{ text: "Let in", onPress: dismissing(onAccept) }}
        secondary={{ text: "Decline", onPress: dismissing(onDecline) }}
      />
    ),
  ),
  notice: render<"notice">(
    ({ title, message, action, icon = Bell, onOpen = action?.onPress }) => (
      <ToastShell
        variant="notice"
        onPress={onOpen}
        title={title}
        subtitle={message}
        action={withDismiss(action)}
        prefix={
          <IconTile
            icon={icon}
            className="bg-bg-tint-coral"
            iconColor="--color-text-coral-strong"
          />
        }
      />
    ),
  ),
  system: render<"system">(({ title, message, icon = Info, onOpen }) => (
    <ToastShell
      variant="system"
      onPress={onOpen}
      title={title}
      subtitle={message}
      prefix={
        <IconTile
          icon={icon}
          className="bg-bg-raised-cool"
          iconColor="--color-text-turquoise"
        />
      }
    />
  )),
} satisfies ToastConfig;

type ToastBehaviour = {
  position: "top";
  autoHide: boolean;
  visibilityTime?: number;
  swipeable: boolean;
  /** A bar along the bottom counts down `visibilityTime`. */
  countdown: boolean;
};

/** Under the status bar, gone after 4 s, swiped up or tapped away. */
const CARD: ToastBehaviour = {
  position: "top",
  autoHide: true,
  visibilityTime: 4000,
  swipeable: true,
  countdown: true,
};

/** Waits until you press one of its buttons. */
const STICKY: ToastBehaviour = {
  position: "top",
  autoHide: false,
  swipeable: false,
  countdown: false,
};

const BEHAVIOUR: Record<ToastType, ToastBehaviour> = {
  error: CARD,
  wave: CARD,
  message: CARD,
  classStarting: STICKY,
  entryRequest: STICKY,
  notice: CARD,
  system: CARD,
};

const queue = createToastQueue((queued) => {
  const type = queued.type as ToastType;
  const { countdown, ...behaviour } = BEHAVIOUR[type];
  const display: ToastDisplay = {
    id: queued.id,
    countdownMs: countdown ? behaviour.visibilityTime : undefined,
    tapToDismiss: behaviour.autoHide,
  };
  RNDefaultToast.show({
    type,
    ...behaviour,
    props: { params: queued.params, display },
    // However it went: timer, swipe, tap or a button.
    onHide: () => queue.closed(queued.id),
  });
});

let lastId = 0;

/** Queues a toast; it shows once the ones ahead of it have gone. */
function show<T extends ToastType>(type: T, params: ToastParams[T]) {
  queue.push({
    id: ++lastId,
    type,
    params,
    urgent: type === "classStarting",
  });
}

export const toast = {
  error: (message: string, title = "Error") =>
    show("error", { title, message }),
  /** Pass `action` for an Undo-style control in the pill. */
  success: (message: string, action?: ToastAction) => showPill(message, action),
  wave: (params: ToastParams["wave"]) => show("wave", params),
  message: (params: ToastParams["message"]) => show("message", params),
  classStarting: (params: ToastParams["classStarting"]) =>
    show("classStarting", params),
  entryRequest: (params: ToastParams["entryRequest"]) =>
    show("entryRequest", params),
  notice: (params: ToastParams["notice"]) => show("notice", params),
  system: (params: ToastParams["system"]) => show("system", params),
  show,
  hide: RNDefaultToast.hide,
};

export function Toast(props: RNToastProps) {
  const insets = useSafeAreaInsets();
  // Position comes from each toast's type; see BEHAVIOUR.
  return (
    <>
      <RNDefaultToast
        config={toastConfig}
        topOffset={insets.top + 8}
        {...props}
      />
      <FeedbackPillHost bottom={insets.bottom + 16} />
    </>
  );
}

/** The success pill, at the bottom of the screen, alongside any card. */
function FeedbackPillHost({ bottom }: { bottom: number }) {
  const pill = useFeedbackPill((state) => state.pill);

  return (
    <View
      pointerEvents="box-none"
      style={[StyleSheet.absoluteFill, { paddingBottom: bottom }]}
      className="justify-end"
    >
      {pill ? (
        <Animated.View
          key={pill.id}
          entering={FadeInDown.duration(200)}
          exiting={FadeOutDown.duration(200)}
        >
          <ToastShell
            variant="feedback"
            title={pill.message}
            action={
              pill.action && {
                text: pill.action.text,
                onPress: () => {
                  pill.action?.onPress();
                  hidePill();
                },
              }
            }
          />
        </Animated.View>
      ) : null}
    </View>
  );
}
