import { useConnectionState, useLocalParticipant } from "@livekit/react-native";

/**
 * Whether the local participant may publish. LiveKit sets `permissions` from
 * the join response without emitting a permissions event, so
 * `useLocalParticipant` alone never re-renders once it lands. Subscribing to
 * the connection state forces that re-render.
 */
export function useCanPublish() {
  useConnectionState();
  const { localParticipant } = useLocalParticipant();
  return localParticipant?.permissions?.canPublish ?? false;
}
