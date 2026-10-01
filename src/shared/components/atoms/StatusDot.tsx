import { cn } from "@shared/utils/style";
import { cva, type VariantProps } from "class-variance-authority";
import { View, type ViewProps } from "react-native";

export const statusDotVariants = cva("size-2 rounded-full", {
  variants: {
    status: {
      online: "bg-status-success",
      away: "bg-status-warning",
      busy: "bg-status-danger",
      offline: "bg-text-disabled",
    },
  },
  defaultVariants: {
    status: "online",
  },
});

export type StatusDotVariantProps = VariantProps<typeof statusDotVariants>;

export interface StatusDotProps extends ViewProps, StatusDotVariantProps {}

export function StatusDot({ status, className, ...props }: StatusDotProps) {
  return (
    <View {...props} className={cn(statusDotVariants({ status }), className)} />
  );
}
