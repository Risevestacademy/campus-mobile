import { cn } from "@shared/utils/style";
import { cva, type VariantProps } from "class-variance-authority";
import { Text as RNText, type TextProps as RNTextProps } from "react-native";

export const textVariants = cva("", {
  variants: {
    variant: {
      display: "font-display text-display",
      h1: "text-h1 font-h1",
      h2: "text-h2 font-h2",
      h3: "text-h3 font-h3",
      h4: "text-h4 font-h4",
      h5: "text-h5 font-h5",
      h6: "text-h6 font-h6",
      "body-lg": "text-body-lg font-body-lg",
      "body-md": "text-body-md font-body-md",
      "body-sm": "text-body-sm font-body-sm",
      caption: "text-caption font-caption",
      label: "text-label font-label",
      overline: "text-overline font-overline uppercase",
    },
    color: {
      primary: "text-text-primary",
      secondary: "text-text-secondary",
      muted: "text-text-muted",
      disabled: "text-text-disabled",
      inverse: "text-text-inverse",
      link: "text-text-link",
      brand: "text-text-brand",
      error: "text-status-error-text",
      success: "text-status-success-text",
      warning: "text-status-warning-text",
      info: "text-status-info-text",
    },
  },
  defaultVariants: {
    variant: "body-md",
    color: "primary",
  },
});

export type TextVariantProps = VariantProps<typeof textVariants>;

type TextProps = RNTextProps & TextVariantProps;

export function Text({ variant, color, className, ...props }: TextProps) {
  return (
    <RNText
      {...props}
      className={cn(textVariants({ variant, color }), className)}
    />
  );
}
