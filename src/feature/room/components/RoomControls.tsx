import { cn } from "@shared/utils/style";
import { useRouter } from "expo-router";
import {
  Hand,
  Lock,
  LogOut,
  Mic,
  MicOff,
  MoreHorizontal,
  Smile,
  Video,
  VideoOff,
} from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

import { useCameraToggle, useMicToggle } from "../hooks";
import { MicBlockedSheet } from "./MicBlockedSheet";

const StyledMic = withUniwind(Mic);
const StyledMicOff = withUniwind(MicOff);
const StyledVideo = withUniwind(Video);
const StyledVideoOff = withUniwind(VideoOff);
const StyledHand = withUniwind(Hand);
const StyledSmile = withUniwind(Smile);
const StyledMore = withUniwind(MoreHorizontal);
const StyledLogOut = withUniwind(LogOut);
const StyledLock = withUniwind(Lock);

function RoundControl({
  label,
  onPress,
  disabled,
  locked,
  className,
  children,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  locked?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      className={cn(
        "size-12 items-center justify-center rounded-full bg-[#2C373D]",
        className,
      )}
    >
      {children}
      {locked && (
        <View className="absolute -top-1 -right-1 size-6 items-center justify-center rounded-full bg-overlay-white-50">
          <StyledLock colorClassName="accent-text-on-dark" size={12} />
        </View>
      )}
    </Pressable>
  );
}

export function RoomControls() {
  const router = useRouter();
  const {
    micEnabled,
    toggleMic,
    canPublish,
    permissionDenied,
    dismissPermissionDenied,
  } = useMicToggle();
  const camera = useCameraToggle();
  const CameraIcon =
    camera.cameraEnabled && canPublish ? StyledVideo : StyledVideoOff;
  const [handRaised, setHandRaised] = React.useState(false);
  const MicIcon = micEnabled && canPublish ? StyledMic : StyledMicOff;
  const { bottom } = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center justify-between rounded-t-3xl bg-text-on-accent px-4 pt-3"
      style={{ paddingBottom: Math.max(bottom, 16) + 8 }}
    >
      <RoundControl
        label={micEnabled ? "Mute microphone" : "Unmute microphone"}
        disabled={!canPublish}
        locked={!canPublish}
        onPress={() => void toggleMic()}
        className={micEnabled && canPublish ? "bg-action-primary" : undefined}
      >
        <MicIcon colorClassName="accent-text-on-dark" size={20} />
      </RoundControl>
      <RoundControl
        label={camera.cameraEnabled ? "Turn camera off" : "Turn camera on"}
        disabled={!canPublish}
        locked={!canPublish}
        onPress={() => void camera.toggleCamera()}
        className={
          camera.cameraEnabled && canPublish ? "bg-action-primary" : undefined
        }
      >
        <CameraIcon colorClassName="accent-text-on-dark" size={20} />
      </RoundControl>
      <RoundControl
        label={handRaised ? "Lower hand" : "Raise hand"}
        onPress={() => setHandRaised((raised) => !raised)}
        className={handRaised ? "bg-action-accent" : "bg-action-accent/90"}
      >
        <StyledHand colorClassName="accent-text-primary" size={20} />
      </RoundControl>
      <RoundControl label="React" disabled>
        <StyledSmile colorClassName="accent-text-on-dark" size={20} />
      </RoundControl>
      <RoundControl label="More" disabled>
        <StyledMore colorClassName="accent-text-on-dark" size={20} />
      </RoundControl>
      <RoundControl
        label="Leave space"
        onPress={() => router.back()}
        className="bg-status-live"
      >
        <StyledLogOut colorClassName="accent-text-on-dark" size={20} />
      </RoundControl>
      <MicBlockedSheet
        visible={permissionDenied}
        onDismiss={dismissPermissionDenied}
      />
      <MicBlockedSheet
        kind="camera"
        visible={camera.permissionDenied}
        onDismiss={camera.dismissPermissionDenied}
      />
    </View>
  );
}
