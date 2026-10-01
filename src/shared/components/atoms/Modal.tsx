import { Warning } from "@shared/icons";
import { cn } from "@shared/utils/style";
import { ReactNode } from "react";
import { Modal as RNModal, Pressable, View } from "react-native";

import { Button, type ButtonProps } from "./Button";
import { Text } from "./Text";

export interface ModalProps {
  visible: boolean;
  title: string;
  description?: string;
  /** Replaces the default warning icon. */
  icon?: ReactNode;
  actionLabel?: string;
  actionVariant?: ButtonProps["variant"];
  onAction?: () => void;
  /** Called on backdrop tap and Android back press. */
  onClose?: () => void;
  className?: string;
}

export function Modal({
  visible,
  title,
  description,
  icon,
  actionLabel,
  actionVariant = "secondary",
  onAction,
  onClose,
  className,
}: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        className="flex-1 justify-center bg-overlay-scrim px-6"
      >
        {/* Inner Pressable swallows taps so only the backdrop closes the modal. */}
        <Pressable
          className={cn(
            "items-center gap-3 rounded-xl border border-border-default bg-white p-6 dark:bg-bg-hover",
            className,
          )}
        >
          <View className="size-14 items-center justify-center rounded-full bg-status-danger-subtle">
            {icon ?? <Warning />}
          </View>

          <View className="items-center gap-2">
            <Text className="text-center font-h5 text-h5 text-text-primary">
              {title}
            </Text>
            {description ? (
              <Text className="text-center font-body-sm text-body-sm text-[#6B7280] dark:text-text-on-dark">
                {description}
              </Text>
            ) : null}
          </View>

          {actionLabel ? (
            <Button
              label={actionLabel}
              variant={actionVariant}
              className={cn(
                "mt-2 self-stretch",
                actionVariant === "secondary" &&
                  "border-border-focus dark:border-bg-band",
              )}
              labelClassName={cn(
                actionVariant === "secondary" &&
                  "text-text-brand dark:text-text-on-dark",
              )}
              onPress={onAction}
            />
          ) : null}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
