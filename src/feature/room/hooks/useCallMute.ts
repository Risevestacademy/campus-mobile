import { useConnectionState } from "@livekit/react-native";
import { ConnectionState } from "livekit-client";

import { useMicToggle } from "./useMicToggle";

/**
 * Mute for the floating call, which shows on every tab. It is the same mic the
 * room controls use (the app-wide room), so the two always agree.
 *
 * `canToggle` is false while the room isn't connected or you may not speak: a
 * toggle then would only fail, and a failure here reads as a denied
 * microphone permission. The call shows as muted meanwhile, since your mic is
 * off.
 */
export function useCallMute() {
  const connection = useConnectionState();
  const mic = useMicToggle();
  const canToggle = connection === ConnectionState.Connected && mic.canPublish;

  return {
    muted: !mic.micEnabled,
    canToggle,
    toggle: () => {
      if (canToggle) void mic.toggleMic();
    },
    permissionDenied: mic.permissionDenied,
    dismissPermissionDenied: mic.dismissPermissionDenied,
  };
}
