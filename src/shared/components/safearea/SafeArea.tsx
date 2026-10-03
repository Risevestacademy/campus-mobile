import { cn } from "@shared/utils/style";
import {
  SafeAreaView,
  SafeAreaViewProps,
} from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

const StyledSafeAreaView = withUniwind(SafeAreaView);

interface SafeAreaProps extends SafeAreaViewProps {
  disableBottomInset?: boolean;
}

export default function SafeArea({
  disableBottomInset,
  className,
  ...props
}: SafeAreaProps) {
  return (
    <StyledSafeAreaView
      className={cn("flex-1 bg-bg-page px-6", className)}
      edges={
        disableBottomInset
          ? ["top", "left", "right"]
          : ["top", "left", "right", "bottom"]
      }
      {...props}
    />
  );
}
