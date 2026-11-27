import { AudioSession } from "@livekit/react-native";
import React from "react";

/** Rooms holding the native audio session open right now. */
let holders = 0;

/**
 * Keeps the native audio session open while mounted. The space call and the
 * broadcast room both need it and come and go separately, so it starts with
 * the first holder and stops only when the last one leaves: closing the space
 * screen mustn't silence a broadcast that's playing.
 */
export function useAudioSession() {
  React.useEffect(() => {
    holders += 1;
    if (holders === 1) void AudioSession.startAudioSession();
    return () => {
      holders -= 1;
      if (holders === 0) void AudioSession.stopAudioSession();
    };
  }, []);
}
