import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheet } from "@shared/components";
import { Button, Text } from "@shared/components/atoms";
import React from "react";
import { Linking } from "react-native";

export function MicBlockedSheet({
  visible,
  onDismiss,
  kind = "microphone",
}: {
  visible: boolean;
  onDismiss: () => void;
  kind?: "microphone" | "camera";
}) {
  const ref = React.useRef<BottomSheetModal>(null);

  React.useEffect(() => {
    if (visible) ref.current?.present();
    else ref.current?.dismiss();
  }, [visible]);

  return (
    <BottomSheet ref={ref} onDismiss={onDismiss}>
      <Text variant="h4">Campus can&apos;t use your {kind}</Text>
      <Text color="secondary">
        {kind === "microphone"
          ? "Allow microphone access in Settings so people in your space can hear you."
          : "Allow camera access in Settings so people in your space can see you."}
      </Text>
      <Button
        label="Open Settings"
        onPress={() => {
          void Linking.openSettings();
          onDismiss();
        }}
      />
    </BottomSheet>
  );
}
