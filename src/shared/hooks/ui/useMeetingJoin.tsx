import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheet } from "@shared/components";
import { Button, MultiAvatar, Row, Text } from "@shared/components/atoms";
import { AudioLines, MicOff, VideoOff } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import { withUniwind } from "uniwind";

const MeetingJoinModalContext =
  React.createContext<MeetingJoinContextValue | null>(null);

export type MeetingJoinData = {
  meetingId: string;
  title: string;
  hostName?: string;
  location: string;
  startsAt?: Date;
  participants: { imageUrl?: string; name: string }[];
};

type MeetingJoinContextValue = {
  open: (data: MeetingJoinData) => void;
  close: () => void;
  data: MeetingJoinData | null;
};

const StyledMicOff = withUniwind(MicOff);
const StyledAudioLines = withUniwind(AudioLines);
const StyledVideoOff = withUniwind(VideoOff);
// const StyledVideo = withUniwind(Video);
// const StyledHand = withUniwind(Hand);

export function MeetingJoinProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = React.useRef<BottomSheetModal>(null);
  const [data, setData] = React.useState<MeetingJoinData | null>(null);

  const open = React.useCallback((next: MeetingJoinData) => {
    setData(next);
    ref.current?.present();
  }, []);

  const close = React.useCallback(() => {
    ref.current?.dismiss();
  }, []);

  // Clear data after the sheet finishes closing, so content doesn't vanish mid-animation
  const handleDismiss = React.useCallback(() => setData(null), []);

  const value = React.useMemo(
    () => ({ open, close, data }),
    [open, close, data],
  );

  return (
    <MeetingJoinModalContext.Provider value={value}>
      {children}
      <BottomSheet ref={ref} onDismiss={handleDismiss}>
        {/* the ui is set based on the  */}
        {data && <MeetingJoinView data={data} onClose={close} />}
      </BottomSheet>
    </MeetingJoinModalContext.Provider>
  );
}

function IconRow({ text, icon }: { text: string; icon: typeof StyledMicOff }) {
  const Icon = icon;
  return (
    <Row className="gap-2">
      <View className="size-5.5 items-center justify-center rounded-full bg-bg-tint-turquoise dark:bg-bg-raised-cool">
        <Icon colorClassName="accent-text-turquoise" size={14} />
      </View>
      <Text color="secondary" variant="body-sm">
        {text}
      </Text>
    </Row>
  );
}

function MeetingJoinView({
  data,
  onClose,
}: {
  onClose?: () => void;
  data: MeetingJoinData;
}) {
  return (
    <View className="gap-4">
      <View className="gap-3 rounded-xl bg-bg-ink-card p-4 dark:border dark:border-bg-raised-cool">
        <Row gap="sm">
          <MultiAvatar
            size={40}
            placeholderClassName="text-text-on-dark font-h6 text-[18px]"
            ringClassName="border-text-on-accent"
            participants={data.participants.map((e) => ({
              placeholder: e.name[0],
              imageUrl: e.imageUrl,
            }))}
          />
          <View>
            <Text>{data.title}</Text>
            <Row>
              <StyledAudioLines
                colorClassName="accent-text-turquoise-bright"
                size={14}
              />
              <Text className="text-text-turquoise-bright" variant="caption">
                {data.location}
              </Text>
            </Row>
          </View>
        </Row>
      </View>
      <View className="gap-2">
        <IconRow
          text={"You join muted. Unmute when you’re ready."}
          icon={StyledMicOff}
        />
        <IconRow
          text={"Only people near you in Main hallway hear you."}
          icon={StyledAudioLines}
        />
        <IconRow
          text={"Your camera stays off unless you turn it on."}
          icon={StyledVideoOff}
        />
      </View>
      <View>
        <Row>
          <Button
            label="Not now"
            variant="secondary"
            className="flex-1"
            onPress={onClose}
          />
          <Button className="flex-1">
            <StyledAudioLines colorClassName="accent-text-on-dark" size={16} />
            <Text className="text-text-on-dark">Join</Text>
          </Button>
        </Row>
      </View>
    </View>
  );
}

export function useMeetingJoin() {
  const ctx = React.useContext(MeetingJoinModalContext);
  if (!ctx) {
    throw new Error("useMeetingJoin must be used inside <MeetingJoinProvider>");
  }
  return ctx;
}
