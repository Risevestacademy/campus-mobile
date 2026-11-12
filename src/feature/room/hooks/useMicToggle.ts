import { useLocalParticipant } from "@livekit/react-native";
import React from "react";

import { useCanPublish } from "./useCanPublish";

/**
 * Mic state for the local participant. `permissionDenied` turns true when
 * unmuting fails, which is how a denied microphone permission surfaces.
 */
export function useMicToggle() {
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  const [permissionDenied, setPermissionDenied] = React.useState(false);

  const toggleMic = React.useCallback(async () => {
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    } catch (error) {
      if (__DEV__) console.warn("[mic]", error);
      setPermissionDenied(true);
    }
  }, [localParticipant, isMicrophoneEnabled]);

  const dismissPermissionDenied = React.useCallback(
    () => setPermissionDenied(false),
    [],
  );

  const canPublish = useCanPublish();

  return {
    canPublish,
    micEnabled: isMicrophoneEnabled,
    toggleMic,
    permissionDenied,
    dismissPermissionDenied,
  };
}
