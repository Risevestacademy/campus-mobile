import { useLocalParticipant } from "@livekit/react-native";
import React from "react";

import { useCanPublish } from "./useCanPublish";

/**
 * Camera state for the local participant. `permissionDenied` turns true when
 * turning the camera on fails, which is how a denied camera permission
 * surfaces.
 */
export function useCameraToggle() {
  const { localParticipant, isCameraEnabled } = useLocalParticipant();
  const canPublish = useCanPublish();
  const [permissionDenied, setPermissionDenied] = React.useState(false);

  const toggleCamera = React.useCallback(async () => {
    try {
      await localParticipant.setCameraEnabled(!isCameraEnabled);
    } catch (error) {
      if (__DEV__) console.warn("[camera]", error);
      setPermissionDenied(true);
    }
  }, [localParticipant, isCameraEnabled]);

  const dismissPermissionDenied = React.useCallback(
    () => setPermissionDenied(false),
    [],
  );

  return {
    canPublish,
    cameraEnabled: isCameraEnabled,
    toggleCamera,
    permissionDenied,
    dismissPermissionDenied,
  };
}
