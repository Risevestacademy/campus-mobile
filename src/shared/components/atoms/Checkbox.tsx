import { cn } from "@shared/utils/style";
import { Checkbox as ExpoCheckbox } from "expo-checkbox";
import type { ComponentProps } from "react";
import { withUniwind } from "uniwind";

const StyledExpoCheckBox = withUniwind(ExpoCheckbox);
type CheckboxProps = ComponentProps<typeof StyledExpoCheckBox>;

export function Checkbox({ colorClassName, ...props }: CheckboxProps) {
  return (
    <StyledExpoCheckBox
      colorClassName={cn("accent-action-primary", colorClassName)}
      className="rounded-sm p-0"
      {...props}
    />
  );
}
