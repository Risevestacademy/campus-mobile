import { cn } from "@shared/utils/style";
import { ClassValue } from "clsx";
import { View } from "react-native";

type DividerProp = {
  dividerBgClassName?: ClassValue;
};

export function Divider({
  dividerBgClassName = "bg-bg-raised-cool dark:bg-bg-ink-divider",
}: DividerProp) {
  return <View className={cn(`h-px w-full`, dividerBgClassName)} />;
}
