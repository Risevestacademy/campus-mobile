import { cn } from "@shared/utils/style";
import { cva } from "class-variance-authority";
import { ReactNode } from "react";
import { View, type ViewProps } from "react-native";

import { Text } from "./Text";

export const pillContainerVariants = cva(
  "flex-row items-center justify-center rounded-full self-start",
  {
    variants: {
      color: {
        success: "",
        neutral: "",
        brand: "",
        warning: "",
        error: "",
        info: "",
      },
      variant: {
        solid: "",
        subtle: "",
      },
      size: {
        sm: "px-2.5 py-0.5",
        lg: "px-3.5 py-1",
      },
    },
    compoundVariants: [
      // Success
      {
        color: "success",
        variant: "solid",
        className: "bg-status-success-solid",
      },
      {
        color: "success",
        variant: "subtle",
        className: "bg-status-success-bg-subtle",
      },

      // Neutral
      { color: "neutral", variant: "solid", className: "bg-bg-inverse" },
      {
        color: "neutral",
        variant: "subtle",
        className: "bg-bg-hover",
      },

      // Brand
      {
        color: "brand",
        variant: "solid",
        className: "bg-action-primary-default rounded-full",
      },
      {
        color: "brand",
        variant: "subtle",
        className: "bg-action-primary-disabled",
      },

      // Warning
      {
        color: "warning",
        variant: "solid",
        className: "bg-status-warning-solid",
      },
      {
        color: "warning",
        variant: "subtle",
        className: "bg-status-warning-bg-subtle",
      },

      // Error
      { color: "error", variant: "solid", className: "bg-status-error-solid" },
      {
        color: "error",
        variant: "subtle",
        className: "bg-status-error-bg-subtle",
      },

      // Info
      { color: "info", variant: "solid", className: "bg-status-info-solid" },
      {
        color: "info",
        variant: "subtle",
        className: "bg-status-info-bg-subtle",
      },
    ],
    defaultVariants: {
      color: "neutral",
      variant: "subtle",
      size: "sm",
    },
  },
);

export const pillTextVariants = cva("font-label text-center", {
  variants: {
    color: {
      success: "",
      neutral: "",
      brand: "",
      warning: "",
      error: "",
      info: "",
    },
    variant: {
      solid: "",
      subtle: "",
    },
    size: {
      sm: "text-caption",
      lg: "text-body-sm",
    },
  },
  compoundVariants: [
    // Success
    { color: "success", variant: "solid", className: "text-white" },
    {
      color: "success",
      variant: "subtle",
      className: "text-status-success-text",
    },

    // Neutral
    { color: "neutral", variant: "solid", className: "text-text-inverse" },
    { color: "neutral", variant: "subtle", className: "text-text-secondary" },

    // Brand
    { color: "brand", variant: "solid", className: "text-action-primary-text" },
    { color: "brand", variant: "subtle", className: "text-text-brand" },

    // Warning
    {
      color: "warning",
      variant: "solid",
      className: "text-neutral-ui-dark-950",
    },
    {
      color: "warning",
      variant: "subtle",
      className: "text-status-warning-text",
    },

    // Error
    { color: "error", variant: "solid", className: "text-white" },
    { color: "error", variant: "subtle", className: "text-status-error-text" },

    // Info
    { color: "info", variant: "solid", className: "text-white" },
    { color: "info", variant: "subtle", className: "text-status-info-text" },
  ],
  defaultVariants: {
    color: "neutral",
    variant: "subtle",
    size: "sm",
  },
});

export type PillColor =
  "success" | "neutral" | "brand" | "warning" | "error" | "info";
export type PillStyleVariant = "solid" | "subtle";
export type PillSize = "sm" | "lg";

export interface PillProps extends Omit<ViewProps, "style"> {
  label?: string;
  children?: ReactNode;
  color?: PillColor;
  variant?: PillStyleVariant;
  size?: PillSize;
  labelClassName?: string;
  style?: PillStyleVariant | ViewProps["style"];
}

export function Pill({
  label,
  children,
  color = "neutral",
  variant,
  size = "sm",
  className,
  labelClassName,
  style,
  ...props
}: PillProps) {
  const isPillStyleString =
    typeof style === "string" && (style === "solid" || style === "subtle");
  const activeVariant: PillStyleVariant = isPillStyleString
    ? (style as PillStyleVariant)
    : (variant ?? "subtle");
  const customViewStyle = isPillStyleString
    ? undefined
    : (style as ViewProps["style"]);

  const content = label ?? children;

  return (
    <View
      {...props}
      style={customViewStyle}
      className={cn(
        pillContainerVariants({ color, variant: activeVariant, size }),
        className,
      )}
    >
      {typeof content === "string" ? (
        <Text
          className={cn(
            pillTextVariants({ color, variant: activeVariant, size }),
            labelClassName,
          )}
        >
          {content}
        </Text>
      ) : (
        content
      )}
    </View>
  );
}
