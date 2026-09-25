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
  ...props
}: SafeAreaProps) {
  return (
    <StyledSafeAreaView
      className="flex-1 bg-bg-surface px-6"
      edges={
        disableBottomInset
          ? ["top", "left", "right"]
          : ["top", "left", "right", "bottom"]
      }
      {...props}
    />
  );
}
