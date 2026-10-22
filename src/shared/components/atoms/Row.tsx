import { cn } from "@shared/utils/style";
import { cva, type VariantProps } from "class-variance-authority";
import { View, type ViewProps } from "react-native";

export const rowVariants = cva("flex-row", {
  variants: {
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
      baseline: "items-baseline",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly",
    },
    gap: {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-3",
      lg: "gap-4",
      xl: "gap-6",
    },
    wrap: {
      true: "flex-wrap",
      false: "",
    },
  },
  defaultVariants: {
    align: "center",
    justify: "start",
    gap: "sm",
    wrap: false,
  },
});

export type RowVariantProps = VariantProps<typeof rowVariants>;

export type RowProps = ViewProps & RowVariantProps;

export function Row({
  align,
  justify,
  gap,
  wrap,
  className,
  ...props
}: RowProps) {
  return (
    <View
      {...props}
      className={cn(rowVariants({ align, justify, gap, wrap }), className)}
    />
  );
}
