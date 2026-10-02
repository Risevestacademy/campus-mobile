import { cn } from "@shared/utils/style";
import { cva, type VariantProps } from "class-variance-authority";
import { ReactNode, useRef } from "react";
import {
  ActivityIndicator,
  Pressable as RNPressable,
  type PressableProps as RNPressableProps,
} from "react-native";

import { Text } from "./Text";

export const buttonVariants = cva(
  "flex-row items-center justify-center gap-2 rounded-md active:opacity-90 disabled:opacity-50 h-12.5",
  {
    variants: {
      variant: {
        primary: "bg-action-primary active:bg-action-primary-active",
        secondary:
          "bg-transparent border border-border-default active:bg-bg-hover disabled:border-border-default",
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
        className: "bg-action-primary",
      },
      {
        variant: "secondary",
        disabled: true,
        className: "bg-transparent border-border-default",
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
      primary: "text-text-on-dark",
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
  loading?: boolean;
  /** Ms to ignore further presses after one fires. 0 disables the lock. */
  throttle?: number;
}

export function Button({
  variant,
  size,
  className,
  labelClassName,
  children,
  label,
  disabled = false,
  loading = false,
  throttle = 600,
  onPress,
  ...props
}: ButtonProps) {
  const content = label ?? children;
  const isDisabled = Boolean(disabled) || Boolean(loading);
  const locked = useRef(false);

  const handlePress: RNPressableProps["onPress"] = (event) => {
    if (locked.current || isDisabled) return;
    if (throttle > 0) {
      locked.current = true;
      setTimeout(() => {
        locked.current = false;
      }, throttle);
    }
    onPress?.(event);
  };

  const spinnerColorClass =
    disabled && !loading
      ? "accent-text-disabled"
      : variant === "primary"
        ? "accent-text-on-dark"
        : "accent-text-primary";

  return (
    <RNPressable
      {...props}
      onPress={handlePress}
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

      {Boolean(loading) && (
        <ActivityIndicator size="small" colorClassName={spinnerColorClass} />
      )}
    </RNPressable>
  );
}
