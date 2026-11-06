import { cn } from "@shared/utils/style";
import { X } from "lucide-react-native";
import { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { withUniwind } from "uniwind";

import { ModalFrame } from "./Modal";
import { Text } from "./Text";

const StyledX = withUniwind(X);

export interface DialogProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function Dialog({
  visible,
  title,
  onClose,
  children,
  actions,
  className,
}: DialogProps) {
  return (
    <ModalFrame
      visible={visible}
      onClose={onClose}
      className={cn("gap-4 rounded-xl bg-bg-page p-5 shadow-lg", className)}
    >
      <View className="flex-row items-center gap-3">
        <Text variant="h5" className="flex-1" accessibilityRole="header">
          {title}
        </Text>
        <Pressable
          onPress={onClose}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Close"
          className="size-8 items-center justify-center rounded-full active:bg-bg-hover"
        >
          <StyledX size={18} colorClassName="accent-text-muted" />
        </Pressable>
      </View>

      {typeof children === "string" ? (
        <Text variant="body-sm" color="secondary">
          {children}
        </Text>
      ) : (
        children
      )}

      {actions ? <View className="flex-row gap-3">{actions}</View> : null}
    </ModalFrame>
  );
}
