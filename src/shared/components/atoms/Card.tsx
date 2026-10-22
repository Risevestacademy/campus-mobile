import { cn } from "@shared/utils/style";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Pressable,
  type PressableProps,
  View,
  type ViewProps,
} from "react-native";

export const cardVariants = cva("rounded-xl", {
  variants: {
    variant: {
      default: "bg-bg-card",
      ink: "bg-bg-ink-card dark:border dark:border-bg-raised-cool",
      outline: "border border-border-default bg-transparent",
      elevated: "border border-border-hairline bg-bg-card shadow-sm",
    },
    padding: {
      none: "p-0",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    },
    gap: {
      none: "gap-0",
      sm: "gap-2",
      md: "gap-3",
      lg: "gap-4",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "md",
    gap: "md",
  },
});

export type CardVariantProps = VariantProps<typeof cardVariants>;

type CardViewProps = ViewProps & CardVariantProps & { onPress?: undefined };
type CardPressableProps = Omit<PressableProps, "children"> &
  CardVariantProps & {
    children?: React.ReactNode;
    onPress: NonNullable<PressableProps["onPress"]>;
  };

export type CardProps = CardViewProps | CardPressableProps;

export function Card({
  variant,
  padding,
  gap,
  className,
  ...props
}: CardProps) {
  const classes = cn(cardVariants({ variant, padding, gap }), className);

  if (props.onPress) {
    return (
      <Pressable
        {...(props as CardPressableProps)}
        className={cn(classes, "active:opacity-90")}
      />
    );
  }

  return <View {...(props as CardViewProps)} className={classes} />;
}
