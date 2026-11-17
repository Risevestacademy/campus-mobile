import { Row, TextField } from "@shared/components/atoms";
import { ChevronLeft, Search, X } from "lucide-react-native";
import React from "react";
import { Pressable } from "react-native";
import { withUniwind } from "uniwind";

const StyledChevronLeft = withUniwind(ChevronLeft);
const StyledSearch = withUniwind(Search);
const StyledX = withUniwind(X);

/** Back, the search field, and a clear button while there's text. */
export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onBack,
}: {
  value: string;
  onChangeText: (text: string) => void;
  /** The keyboard's search key. */
  onSubmit?: (text: string) => void;
  onBack: () => void;
}) {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <Row className="px-4 py-3" align="center">
      <Pressable
        onPress={onBack}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Back"
      >
        <StyledChevronLeft size={24} colorClassName="accent-icon-default" />
      </Pressable>
      <TextField
        value={value}
        onChangeText={onChangeText}
        autoFocus
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={() => onSubmit?.(value)}
        containerClassName="w-auto flex-1"
        inputContainerClassName="rounded-full"
        placeholder="Search people, spaces, meetings…"
        accessibilityLabel="Search"
        prefix={
          <StyledSearch
            size={18}
            colorClassName={
              isFocused ? "accent-text-primary" : "accent-text-muted"
            }
          />
        }
        suffix={
          value ? (
            <Pressable
              onPress={() => onChangeText("")}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              className="items-center justify-center rounded-full bg-bg-raised-cool p-1"
            >
              <StyledX size={16} colorClassName="accent-text-muted" />
            </Pressable>
          ) : undefined
        }
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </Row>
  );
}
