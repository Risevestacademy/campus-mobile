import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheet } from "@shared/components";
import { Text } from "@shared/components/atoms";
import { cn } from "@shared/utils/style";
import {
  type AppearancePreference,
  useAppearanceStore,
} from "@store/appearance";
import { LucideIcon, Moon, Smartphone, Sun } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledSmartphone = withUniwind(Smartphone);
const StyledSun = withUniwind(Sun);
const StyledMoon = withUniwind(Moon);

type Scheme = "light" | "dark";

const LABELS: Record<AppearancePreference, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

const toScheme = (theme: string): Scheme =>
  theme === "dark" ? "dark" : "light";

/** Icon for the active scheme, so the settings row reflects what's on screen. */
export function appearanceIcon(theme: string): LucideIcon {
  return toScheme(theme) === "dark" ? Moon : Sun;
}

/** e.g. "Light", "Dark", or "System · Dark" when following the device. */
export function appearanceSubtitle(
  preference: AppearancePreference,
  theme: string,
) {
  if (preference !== "system") return LABELS[preference];
  return `${LABELS.system} · ${LABELS[toScheme(theme)]}`;
}

const OPTIONS = [
  { value: "system", icon: StyledSmartphone },
  { value: "light", icon: StyledSun },
  { value: "dark", icon: StyledMoon },
] as const;

export const AppearanceSheet = React.forwardRef<BottomSheetModal>(
  (_props, ref) => {
    const preference = useAppearanceStore((state) => state.preference);
    const setPreference = useAppearanceStore((state) => state.setPreference);

    return (
      <BottomSheet ref={ref}>
        <View className="gap-1">
          <Text variant="h5">Appearance</Text>
          <Text variant="body-sm" color="secondary">
            Choose how Campus by rise looks on this device.
          </Text>
        </View>
        <View className="gap-2">
          {OPTIONS.map((e) => {
            const selected = preference === e.value;
            const Icon = e.icon;
            return (
              <Pressable
                key={e.value}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                className={cn(
                  "flex-row items-center gap-3 rounded-lg p-3",
                  selected
                    ? "border-[0.5px] border-border-focus"
                    : "bg-bg-raised-cool",
                )}
                onPress={() => void setPreference(e.value)}
              >
                <Icon size={16} colorClassName="accent-text-primary" />
                <View className="flex-1 gap-0.5">
                  <Text variant="label" color="primary">
                    {LABELS[e.value]}
                  </Text>
                </View>
                <View
                  className={cn(
                    "size-5 rounded-full border",
                    selected
                      ? "border-[6px] border-border-focus"
                      : "border-border-strong",
                  )}
                />
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    );
  },
);

AppearanceSheet.displayName = "AppearanceSheet";
