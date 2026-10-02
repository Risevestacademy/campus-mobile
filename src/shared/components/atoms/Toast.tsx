import {
  CheckCircleIcon,
  InfoIcon,
  WarningCircleIcon,
} from "phosphor-react-native";
import { View } from "react-native";
import RNDefaultToast, {
  ToastConfig,
  ToastConfigParams,
  type ToastProps as RNToastProps,
} from "react-native-toast-message";
import { withUniwind } from "uniwind";

import { Text } from "./Text";

const StyledWarningCircleIcon = withUniwind(WarningCircleIcon);
const StyledCheckCircleIcon = withUniwind(CheckCircleIcon);
const StyledInfoIcon = withUniwind(InfoIcon);

const toastConfig: ToastConfig = {
  error: ({ text1, text2 }: ToastConfigParams<void>) => (
    <View className="mx-4 my-2 flex-row items-center gap-3 rounded-md border border-status-danger-border bg-bg-card px-4 py-3 shadow-md">
      <StyledWarningCircleIcon
        size={22}
        weight="bold"
        colorClassName="accent-status-danger"
      />
      <View className="flex-1 gap-0.5">
        {Boolean(text1) && (
          <Text color="primary" variant="label">
            {text1}
          </Text>
        )}
        {Boolean(text2) && (
          <Text color="primary" variant="body-sm">
            {text2}
          </Text>
        )}
      </View>
    </View>
  ),
  success: ({ text1, text2 }: ToastConfigParams<void>) => (
    <View className="border-status-success-border bg-status-success-bg-subtle mx-4 my-2 flex-row items-center gap-3 rounded-xl border px-4 py-3 shadow-md">
      <StyledCheckCircleIcon
        size={22}
        weight="bold"
        className="text-status-success-icon"
      />
      <View className="flex-1 gap-0.5">
        {Boolean(text1) && (
          <Text className="text-status-success-text font-label text-label">
            {text1}
          </Text>
        )}
        {Boolean(text2) && (
          <Text className="text-status-success-text font-body-sm text-body-sm opacity-90">
            {text2}
          </Text>
        )}
      </View>
    </View>
  ),
  info: ({ text1, text2 }: ToastConfigParams<void>) => (
    <View className="border-status-info-border bg-status-info-bg-subtle mx-4 my-2 flex-row items-center gap-3 rounded-xl border px-4 py-3 shadow-md">
      <StyledInfoIcon
        size={22}
        weight="bold"
        className="text-status-info-icon"
      />
      <View className="flex-1 gap-0.5">
        {Boolean(text1) && (
          <Text className="text-status-info-text font-label text-label">
            {text1}
          </Text>
        )}
        {Boolean(text2) && (
          <Text className="text-status-info-text font-body-sm text-body-sm opacity-90">
            {text2}
          </Text>
        )}
      </View>
    </View>
  ),
};

export const toast = {
  error: (message: string, title?: string) => {
    RNDefaultToast.show({
      type: "error",
      text1: title ?? "Error",
      text2: message,
    });
  },
  success: (message: string, title?: string) => {
    RNDefaultToast.show({
      type: "success",
      text1: title ?? "Success",
      text2: message,
    });
  },
  info: (message: string, title?: string) => {
    RNDefaultToast.show({
      type: "info",
      text1: title ?? "Info",
      text2: message,
    });
  },
  show: RNDefaultToast.show,
  hide: RNDefaultToast.hide,
};

export function Toast(props: RNToastProps) {
  return <RNDefaultToast config={toastConfig} {...props} position="bottom" />;
}
