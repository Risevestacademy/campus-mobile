import { cn } from "@shared/utils/style";
import { CaretDownIcon, WarningCircleIcon } from "phosphor-react-native";
import { ReactNode, useRef, useState } from "react";
import {
  Pressable,
  TextInput as RNTextInput,
  type TextInputProps as RNTextInputProps,
  View,
} from "react-native";
import { withUniwind } from "uniwind";

import { Text } from "./Text";

const StyledCaretDownIcon = withUniwind(CaretDownIcon);
const StyledWarningCircleIcon = withUniwind(WarningCircleIcon);

export interface TextFieldProps extends Omit<RNTextInputProps, "prefix"> {
  label?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  surfix?: ReactNode;
  helper?: ReactNode;
  error?: boolean | string;
  select?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  containerClassName?: string;
  inputContainerClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  helperClassName?: string;
}

export function TextField({
  label,
  prefix,
  suffix,
  surfix,
  helper,
  error,
  select = false,
  disabled = false,
  placeholder,
  onPress,
  onFocus,
  onBlur,
  containerClassName,
  inputContainerClassName,
  inputClassName,
  labelClassName,
  helperClassName,
  ...props
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<RNTextInput>(null);

  const actualSuffix = suffix ?? surfix;
  const helperText = typeof error === "string" ? error : helper;
  const hasError = Boolean(error);

  const handleContainerPress = () => {
    if (disabled) return;
    if (select) {
      onPress?.();
    } else {
      inputRef.current?.focus();
    }
  };

  const handleFocus: RNTextInputProps["onFocus"] = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur: RNTextInputProps["onBlur"] = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View className={cn("w-full gap-1.5", containerClassName)}>
      {Boolean(label) && (
        <Text
          className={cn(
            "font-label text-label text-text-secondary",
            disabled && "text-text-disabled",
            hasError && "text-text-danger",
            labelClassName,
          )}
        >
          {label}
        </Text>
      )}
      <Pressable
        disabled={disabled}
        onPress={handleContainerPress}
        className={cn(
          "min-h-11 flex-row items-center rounded-lg border bg-bg-card px-3.5 py-2.5 transition-colors",
          hasError
            ? "border-status-danger-border bg-status-danger-subtle"
            : isFocused
              ? "border-border-focus ring-1 ring-border-focus"
              : "border-border-default",
          disabled && "border-border-default bg-bg-hover",
          inputContainerClassName,
        )}
      >
        {Boolean(prefix) && (
          <View className="mr-2 flex-row items-center">
            {typeof prefix === "string" ? (
              <Text className="text-body-md text-text-muted">{prefix}</Text>
            ) : (
              prefix
            )}
          </View>
        )}

        <RNTextInput
          ref={inputRef}
          {...props}
          textAlignVertical="top"
          editable={!disabled && !select}
          placeholder={placeholder}
          onFocus={handleFocus}
          placeholderTextColorClassName="accent-text-muted"
          onBlur={handleBlur}
          className={cn(
            "m-0 flex-1 p-0 font-body-md text-body-md text-text-secondary",
            disabled && "text-text-disabled",
            inputClassName,
          )}
        />

        <View className="ml-2 flex-row items-center gap-1.5">
          {Boolean(actualSuffix) &&
            (typeof actualSuffix === "string" ? (
              <Text className="text-body-md text-text-muted">
                {actualSuffix}
              </Text>
            ) : (
              actualSuffix
            ))}

          {hasError && (
            <StyledWarningCircleIcon
              size={20}
              colorClassName="accent-text-danger-icon"
            />
          )}

          {select && !hasError && !actualSuffix && (
            <StyledCaretDownIcon size={18} colorClassName="accent-icon-muted" />
          )}
        </View>
      </Pressable>
      {Boolean(helperText) && (
        <Text
          className={cn(
            "font-caption text-caption text-text-muted",
            hasError && "text-text-danger",
            helperClassName,
          )}
        >
          {helperText}
        </Text>
      )}
    </View>
  );
}
