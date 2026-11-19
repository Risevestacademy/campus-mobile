import { components } from "@core/api/generated/schema";
import {
  BottomSheetModal,
  useBottomSheet,
  useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { shouldUploadAgain } from "@services/uploads";
import { BottomSheet } from "@shared/components";
import {
  Button,
  Card,
  Checkbox,
  Row,
  Spinner,
  Text,
  TextField,
  toast,
} from "@shared/components/atoms";
import { useMe } from "@shared/hooks/useMe";
import { cn } from "@shared/utils/style";
import { useMySpace, useWorldStore } from "@store/world";
import { usePathname } from "expo-router";
import {
  Bug,
  Check,
  CircleAlert,
  Lightbulb,
  MessageCircle,
  Paperclip,
  Send,
  X,
} from "lucide-react-native";
import React from "react";
import { Image, Pressable, useWindowDimensions, View } from "react-native";
import { useCSSVariable, withUniwind } from "uniwind";

import {
  type FeedbackAttachment,
  useFeedbackAttachments,
  useProfile,
  useSendFeedback,
} from "../hooks";

const StyledBug = withUniwind(Bug);
const StyledLightBulb = withUniwind(Lightbulb);
const StyledMessageCircle = withUniwind(MessageCircle);
const StyledPaperclip = withUniwind(Paperclip);
const StyledSend = withUniwind(Send);
const StyledCheck = withUniwind(Check);
const StyledCircleAlert = withUniwind(CircleAlert);
const StyledX = withUniwind(X);

type FeedbackType = components["schemas"]["FeedbackType"];

const FEEDBACK_TYPES: {
  key: FeedbackType;
  icon: typeof StyledBug;
  title: string;
  /** How the success sheet refers to it: "Your {noun} …". */
  noun: string;
}[] = [
  { key: "bug", icon: StyledBug, title: "Bug", noun: "bug report" },
  { key: "idea", icon: StyledLightBulb, title: "Idea", noun: "idea" },
  {
    key: "report",
    icon: StyledMessageCircle,
    title: "Something Else",
    noun: "feedback",
  },
];

type SentFeedback = { title: string; type: FeedbackType };

type FeedbackDraft = SentFeedback & {
  details: string;
  /** Uploaded screenshots, in the order they were added. */
  attachmentIds: string[];
  /** The space it's about, by name. */
  about?: string;
  /** Whether to attach where in the app they were when sending. */
  includeContext: boolean;
};

const nounFor = (type: FeedbackType) =>
  FEEDBACK_TYPES.find((option) => option.key === type)?.noun ?? "feedback";

/** Every space on campus, by name. Empty until the first world snapshot. */
function useCampusSpaces() {
  const spaces = useWorldStore((state) => state.spaces);
  return React.useMemo(
    () => Object.values(spaces).sort((a, b) => a.name.localeCompare(b.name)),
    [spaces],
  );
}

function SpaceOption({
  name,
  selected,
  onSelect,
}: {
  name: string;
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
      <Text variant="body-sm">{name}</Text>
      {selected && (
        <StyledCheck size={16} colorClassName="accent-action-primary" />
      )}
    </Pressable>
  );
}

const SpacePickerSheet = React.forwardRef<
  BottomSheetModal,
  {
    spaces: { spaceKey: string; name: string }[];
    selected?: string;
    onSelect: (spaceKey: string) => void;
  }
>(({ spaces, selected, onSelect }, ref) => {
  const maxHeight = useWindowDimensions().height * 0.7;
  return (
    // Opens on top of the feedback sheet, which stays up behind it.
    <BottomSheet
      ref={ref}
      stackBehavior="push"
      scrollable
      // Grows with the list up to most of the screen, then scrolls.
      maxDynamicContentSize={maxHeight}
      contentClassName="gap-0"
    >
      <Text variant="h5" className="mb-3">
        Where in Campus?
      </Text>
      {spaces.map((space) => (
        <SpaceOption
          key={space.spaceKey}
          name={space.name}
          selected={space.spaceKey === selected}
          onSelect={() => onSelect(space.spaceKey)}
        />
      ))}
    </BottomSheet>
  );
});

SpacePickerSheet.displayName = "SpacePickerSheet";

const ATTACHMENT_LABEL: Record<FeedbackAttachment["state"], string> = {
  uploading: "uploading",
  ready: "added",
  failed: "didn't upload",
  expired: "expired, add it again",
};

function AttachmentThumb({
  attachment,
  index,
  onRemove,
}: {
  attachment: FeedbackAttachment;
  index: number;
  onRemove: () => void;
}) {
  const { state } = attachment;
  return (
    <View
      className="size-16 overflow-hidden rounded-lg border border-border-default"
      accessible
      accessibilityLabel={`Screenshot ${index + 1}, ${ATTACHMENT_LABEL[state]}`}
    >
      <Image
        source={{ uri: attachment.uri }}
        className={cn("size-full", state !== "ready" && "opacity-50")}
      />
      {state === "uploading" ? (
        <View className="absolute inset-0 items-center justify-center">
          <Spinner size={16} />
        </View>
      ) : state === "failed" || state === "expired" ? (
        <View className="absolute inset-0 items-center justify-center">
          <StyledCircleAlert size={18} colorClassName="accent-status-danger" />
        </View>
      ) : null}
      <Pressable
        onPress={onRemove}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Remove screenshot ${index + 1}`}
        className="absolute top-1 right-1 size-5 items-center justify-center rounded-full bg-bg-ink-card"
      >
        <StyledX size={12} colorClassName="accent-text-on-dark" />
      </Pressable>
    </View>
  );
}

function Screenshots({
  attachments,
}: {
  attachments: ReturnType<typeof useFeedbackAttachments>;
}) {
  const { items, add, remove, canAdd, max } = attachments;
  const expired = items.some((item) => item.state === "expired");

  return (
    <View className="gap-2">
      <Row justify="between">
        <Text variant="label">Screenshots</Text>
        {items.length > 0 ? (
          <Text variant="caption" color="secondary">
            {items.length} of {max}
          </Text>
        ) : null}
      </Row>
      {items.length > 0 ? (
        <Row wrap>
          {items.map((item, index) => (
            <AttachmentThumb
              key={item.key}
              attachment={item}
              index={index}
              onRemove={() => remove(item.key)}
            />
          ))}
        </Row>
      ) : null}
      {expired ? (
        <Text variant="caption" className="text-text-danger">
          Some screenshots went up too long ago. Remove them and add them again.
        </Text>
      ) : null}
      {canAdd ? (
        <Pressable
          onPress={() => void add()}
          accessibilityRole="button"
          accessibilityLabel="Add screenshots"
        >
          <Card className="rounded-lg border border-dashed border-border-strong bg-bg-raised-cool">
            <Row>
              <StyledPaperclip colorClassName="accent-text-muted" size={16} />
              <View>
                <Text variant="label">Add a screenshot</Text>
                <Text variant="caption" color="secondary">
                  Tap to choose images, up to {max}
                </Text>
              </View>
            </Row>
          </Card>
        </Pressable>
      ) : null}
    </View>
  );
}

function FeedbackForm({
  sending,
  onSend,
}: {
  sending: boolean;
  onSend: (feedback: FeedbackDraft) => void;
}) {
  const [title, setTitle] = React.useState("");
  const [details, setDetails] = React.useState("");
  const spaces = useCampusSpaces();
  const mySpace = useMySpace();
  const [spaceKey, setSpaceKey] = React.useState(mySpace?.spaceKey);
  const space = spaces.find((option) => option.spaceKey === spaceKey);
  const spacePicker = React.useRef<BottomSheetModal>(null);
  const [selectedType, setSelectedType] = React.useState<FeedbackType>("bug");
  const [includeDeviceInfo, setIncludeDeviceInfo] = React.useState(true);
  const selectedFillColor = useCSSVariable("--color-text-on-dark") as string;
  const attachments = useFeedbackAttachments();

  const submit = () => {
    const attachmentIds = attachments.take();
    // Marked expired; the list says to add them again.
    if (!attachmentIds) return;
    onSend({
      type: selectedType,
      title: title.trim(),
      details: details.trim(),
      about: space?.name,
      includeContext: includeDeviceInfo,
      attachmentIds,
    });
  };

  return (
    <>
      <View className="gap-1">
        <Text variant="h5">New feedback</Text>
      </View>
      <View className="gap-2">
        <Text variant="label">What kind of feedback?</Text>
        <Row>
          {FEEDBACK_TYPES.map((e, i) => {
            const Icon = e.icon;
            const selected = selectedType === e.key;
            return (
              <Pressable
                onPress={() => setSelectedType(e.key)}
                key={i}
                className={cn(
                  "rounded-lg border border-border-default bg-bg-card p-2 px-3",
                  selected ? "border-border-focus bg-bg-hover" : "",
                )}
              >
                <Row>
                  <Icon
                    size={16}
                    fill={selected ? selectedFillColor : "transparent"}
                    colorClassName="accent-text-on-dark"
                  />
                  <Text variant="label">{e.title}</Text>
                </Row>
              </Pressable>
            );
          })}
        </Row>
      </View>
      <TextField
        label="Title"
        inBottomSheet
        value={title}
        onChangeText={setTitle}
        placeholder="Title of the feedback"
        labelClassName="text-text-primary"
      />
      <TextField
        label="Details"
        inBottomSheet
        value={details}
        onChangeText={setDetails}
        multiline
        inputClassName="h-20"
        labelClassName="text-text-primary"
        placeholder="A description of the feedback"
      />
      <TextField
        label="Where in Campus?"
        select
        labelClassName="text-text-primary"
        value={space?.name ?? ""}
        placeholder={spaces.length ? "Pick a space" : "Campus is loading…"}
        disabled={!spaces.length}
        onPress={() => spacePicker.current?.present()}
      />
      <SpacePickerSheet
        ref={spacePicker}
        spaces={spaces}
        selected={spaceKey}
        onSelect={setSpaceKey}
      />
      <Screenshots attachments={attachments} />
      <Row>
        <Checkbox
          value={includeDeviceInfo}
          onValueChange={setIncludeDeviceInfo}
        />
        <Text variant="body-sm">
          Include device and browser info (helps us fix bugs faster)
        </Text>
      </Row>
      <Button
        // The API needs both a title and details; screenshots must be up.
        disabled={!title.trim() || !details.trim() || attachments.isUploading}
        loading={sending}
        onPress={submit}
      >
        <StyledSend size={16} colorClassName="accent-text-on-dark" />
        <Text variant="label">Send feedback</Text>
      </Button>
    </>
  );
}

function DoneButton() {
  const { close } = useBottomSheet();
  return (
    <Button label="Done" onPress={() => close()} className="self-stretch" />
  );
}

const FeedbackSentSheet = React.forwardRef<
  BottomSheetModal,
  { sent: SentFeedback; onDismiss: () => void }
>(({ sent, onDismiss }, ref) => {
  const { data: me } = useProfile();
  return (
    <BottomSheet
      ref={ref}
      stackBehavior="push"
      onDismiss={onDismiss}
      contentClassName="items-center"
    >
      <View className="size-14 items-center justify-center rounded-full bg-status-success-subtle">
        <StyledCheck size={28} colorClassName="accent-status-success" />
      </View>
      <View className="items-center gap-1">
        <Text variant="h4">Thanks, {me?.firstName}. We got it</Text>
        <Text variant="body-sm" color="secondary" className="text-center">
          Your {nounFor(sent.type)} “{sent.title}” is with the Rise team. We
          read every note.
        </Text>
      </View>
      <Card className="items-start self-stretch bg-bg-raised-cool">
        <Text variant="overline" color="secondary">
          WHAT HAPPENS NEXT
        </Text>
        <Text variant="body-sm">The team reviews new feedback every week</Text>
        <Text variant="body-sm">
          We can’t send updates on each one, but it all shapes what we build
        </Text>
        <Text variant="body-sm">
          Spotted something else? Send more feedback anytime
        </Text>
      </Card>
      <DoneButton />
    </BottomSheet>
  );
});

FeedbackSentSheet.displayName = "FeedbackSentSheet";

/** Lets the success sheet close the form without touching other sheets. */
const FORM_SHEET = "new-feedback";

export const NewFeedbackBottomSheet = React.forwardRef<BottomSheetModal>(
  (_props, ref) => {
    const sentSheet = React.useRef<BottomSheetModal>(null);
    const { dismiss } = useBottomSheetModal();
    const [sent, setSent] = React.useState<SentFeedback>({
      title: "",
      type: "bug",
    });
    const [sending, setSending] = React.useState(false);
    // Bumped each time the form closes. A send remembers the one it started
    // in, and a reply for a form that has since closed is ignored.
    const session = React.useRef(0);

    const { send: sendFeedback } = useSendFeedback();
    const { data: me } = useMe();
    const path = usePathname();

    const send = async ({ includeContext, ...feedback }: FeedbackDraft) => {
      const startedIn = session.current;
      setSending(true);
      try {
        const receipt = await sendFeedback({
          ...feedback,
          cohortId: me?.membership?.cohortId ?? undefined,
          context: includeContext ? { path } : undefined,
        });
        if (startedIn !== session.current) return;
        setSent({ title: receipt.title, type: receipt.type });
        sentSheet.current?.present();
      } catch (error) {
        if (startedIn !== session.current) return;
        toast.error(
          shouldUploadAgain(error)
            ? "A screenshot didn't go up in time. Remove it and add it again."
            : error instanceof Error
              ? error.message
              : "Please try again.",
          "Couldn't send feedback",
        );
      } finally {
        if (startedIn === session.current) setSending(false);
      }
    };

    const onFormDismiss = () => {
      session.current += 1;
      setSending(false);
    };

    return (
      <>
        <BottomSheet
          ref={ref}
          name={FORM_SHEET}
          onDismiss={onFormDismiss}
          // Scrolls once the form is taller than the screen, so Send stays
          // reachable on small phones and with the keyboard up.
          scrollable
          keyboardBlurBehavior="restore"
        >
          <FeedbackForm sending={sending} onSend={send} />
        </BottomSheet>
        <FeedbackSentSheet
          ref={sentSheet}
          sent={sent}
          onDismiss={() => dismiss(FORM_SHEET)}
        />
      </>
    );
  },
);

NewFeedbackBottomSheet.displayName = "NewFeedbackBottomSheet";
