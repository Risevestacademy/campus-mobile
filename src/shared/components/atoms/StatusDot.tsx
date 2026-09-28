import { cn } from "@shared/utils/style";
import { cva, type VariantProps } from "class-variance-authority";
import { View, type ViewProps } from "react-native";

export const statusDotVariants = cva("size-2 rounded-full", {
  variants: {
    status: {
      online: "bg-status-success-solid",
      away: "bg-status-warning-solid",
      busy: "bg-status-error-solid",
      offline: "bg-bg-disabled",
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
