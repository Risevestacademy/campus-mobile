import { cn } from "@shared/utils/style";
import { cva, type VariantProps } from "class-variance-authority";
import { ReactNode } from "react";
import {
  Pressable as RNPressable,
  type PressableProps as RNPressableProps,
} from "react-native";

import { Text } from "./Text";

export const buttonVariants = cva(
  "flex-row items-center justify-center rounded-lg active:opacity-90 disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-action-primary-default active:bg-action-primary-active disabled:bg-action-primary-disabled",
        secondary:
          "bg-transparent border border-border-default active:bg-bg-hover disabled:border-border-disabled",
        tertiary: "bg-transparent active:bg-bg-hover disabled:bg-transparent",
      },
      size: {
        sm: "px-3 py-1.5",
        md: "px-4 py-2.5",
        lg: "px-6 py-3.5",
      },
      disabled: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "primary",
        disabled: true,
        className: "bg-action-primary-disabled",
      },
      {
        variant: "secondary",
        disabled: true,
        className: "bg-transparent border-border-disabled",
      },
      {
        variant: "tertiary",
        disabled: true,
        className: "bg-transparent",
      },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
      disabled: false,
    },
  },
);

export const buttonTextVariants = cva("font-label text-center", {
  variants: {
    variant: {
      primary: "text-action-primary-text",
      secondary: "text-text-primary",
      tertiary: "text-text-primary",
    },
    size: {
      sm: "text-body-sm",
      md: "text-label",
      lg: "text-body-lg",
    },
    disabled: {
      true: "text-text-disabled",
      false: "",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
    disabled: false,
  },
});

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends Omit<RNPressableProps, "children" | "disabled">, ButtonVariantProps {
  children?: ReactNode;
  label?: string;
  labelClassName?: string;
  disabled?: boolean;
}

export function Button({
  variant,
  size,
  className,
  labelClassName,
  children,
  label,
  disabled = false,
  ...props
}: ButtonProps) {
  const content = label ?? children;
  const isDisabled = Boolean(disabled);

  return (
    <RNPressable
      {...props}
      disabled={isDisabled}
      className={cn(
        buttonVariants({ variant, size, disabled: isDisabled }),
        className,
      )}
    >
      {typeof content === "string" ? (
        <Text
          className={cn(
            buttonTextVariants({ variant, size, disabled: isDisabled }),
            labelClassName,
          )}
        >
          {content}
        </Text>
      ) : (
        content
      )}
    </RNPressable>
  );
}
