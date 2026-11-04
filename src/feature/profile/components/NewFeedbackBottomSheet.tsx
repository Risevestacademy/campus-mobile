import { components } from "@core/api/generated/schema";
import {
  BottomSheetModal,
  useBottomSheet,
  useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { BottomSheet } from "@shared/components";
import {
  Button,
  Card,
  Checkbox,
  Row,
  Text,
  TextField,
  toast,
} from "@shared/components/atoms";
import { useMe } from "@shared/hooks/useMe";
import { cn } from "@shared/utils/style";
import { usePathname } from "expo-router";
import {
  Bug,
  Check,
  Lightbulb,
  MessageCircle,
  Paperclip,
  Send,
} from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";
import { useCSSVariable, withUniwind } from "uniwind";

import { useProfile, useSendFeedback } from "../hooks";

const StyledBug = withUniwind(Bug);
const StyledLightBulb = withUniwind(Lightbulb);
const StyledMessageCircle = withUniwind(MessageCircle);
const StyledPaperclip = withUniwind(Paperclip);
const StyledSend = withUniwind(Send);
const StyledCheck = withUniwind(Check);

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
  /** Whether to attach where in the app they were when sending. */
  includeContext: boolean;
};

const nounFor = (type: FeedbackType) =>
  FEEDBACK_TYPES.find((option) => option.key === type)?.noun ?? "feedback";

/** Lives inside the sheet, so its state is cleared when the sheet closes. */
function FeedbackForm({
  sending,
  onSend,
}: {
  sending: boolean;
  onSend: (feedback: FeedbackDraft) => void;
}) {
  const [title, setTitle] = React.useState("");
  const [details, setDetails] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<FeedbackType>("bug");
  const [includeDeviceInfo, setIncludeDeviceInfo] = React.useState(true);
  const selectedFillColor = useCSSVariable("--color-text-on-dark") as string;

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
        value={title}
        onChangeText={setTitle}
        placeholder="Title of the feedback"
        labelClassName="text-text-primary"
      />
      <TextField
        label="Details"
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
        defaultValue="Mentor pod 2"
      />
      <View className="gap-2">
        <Text variant="label">Screenshot</Text>
        <Card className="rounded-lg border border-dashed border-border-strong bg-bg-raised-cool">
          <Row>
            <StyledPaperclip colorClassName="accent-text-muted" size={16} />
            <View>
              <Text variant="label"> Add a screenshot</Text>
              <Text variant="caption" color="secondary">
                Click to select an image
              </Text>
            </View>
          </Row>
        </Card>
      </View>
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
        // The API needs both a title and details.
        disabled={!title.trim() || !details.trim()}
        loading={sending}
        onPress={() =>
          onSend({
            type: selectedType,
            title: title.trim(),
            details: details.trim(),
            includeContext: includeDeviceInfo,
          })
        }
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

export const NewFeedbackBottomSheet = React.forwardRef<BottomSheetModal>(
  (_props, ref) => {
    const sentSheet = React.useRef<BottomSheetModal>(null);
    const { dismissAll } = useBottomSheetModal();
    const [sent, setSent] = React.useState<SentFeedback>({
      title: "",
      type: "bug",
    });

    const { send: sendFeedback, isSending } = useSendFeedback();
    const { data: me } = useMe();
    const path = usePathname();

    const send = async ({ includeContext, ...feedback }: FeedbackDraft) => {
      try {
        const receipt = await sendFeedback({
          ...feedback,
          cohortId: me?.membership?.cohortId ?? undefined,
          context: includeContext ? { path } : undefined,
        });
        setSent({ title: receipt.title, type: receipt.type });
        sentSheet.current?.present();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Please try again.",
          "Couldn't send feedback",
        );
      }
    };

    return (
      <>
        <BottomSheet ref={ref}>
          <FeedbackForm sending={isSending} onSend={send} />
        </BottomSheet>
        <FeedbackSentSheet ref={sentSheet} sent={sent} onDismiss={dismissAll} />
      </>
    );
  },
);

NewFeedbackBottomSheet.displayName = "NewFeedbackBottomSheet";
