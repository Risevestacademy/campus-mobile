import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  type BottomSheetModalProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { cn } from "@shared/utils/style";
import React, { forwardRef } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useResolveClassNames, withUniwind } from "uniwind";

const StyledBottomSheetView = withUniwind(BottomSheetView);

const renderHandle = () => (
  <View className="flex-row justify-center p-3">
    <View className="h-1.25 w-9 rounded-full bg-border-strong" />
  </View>
);

const renderBackdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
);

type SheetProps = Omit<BottomSheetModalProps, "children"> & {
  children: React.ReactNode;
  contentClassName?: string;
};

export const BottomSheet = forwardRef<BottomSheetModal, SheetProps>(
  ({ children, contentClassName = "", ...props }, ref) => {
    const background = useResolveClassNames("bg-bg-card");
    const { bottom } = useSafeAreaInsets();

    return (
      <BottomSheetModal
        ref={ref}
        enablePanDownToClose
        backgroundStyle={background}
        handleComponent={renderHandle}
        backdropComponent={renderBackdrop}
        {...props}
      >
        <StyledBottomSheetView
          className={cn("gap-4 px-6", contentClassName)}
          style={{ paddingBottom: bottom + 8 }}
        >
          {children}
        </StyledBottomSheetView>
      </BottomSheetModal>
    );
  },
);

BottomSheet.displayName = "Sheet";
