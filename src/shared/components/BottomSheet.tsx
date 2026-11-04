import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  type BottomSheetModalProps,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { cn } from "@shared/utils/style";
import React, { forwardRef } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useResolveClassNames, withUniwind } from "uniwind";

const StyledBottomSheetView = withUniwind(BottomSheetView);
const StyledBottomSheetScrollView = withUniwind(BottomSheetScrollView);

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
  /**
   * Scrolls its content once it is taller than the screen allows. The scroll
   * view has to be the sheet's own content for gorhom to hand drags between
   * scrolling and the sheet, so don't nest one inside a plain sheet.
   */
  scrollable?: boolean;
};

export const BottomSheet = forwardRef<BottomSheetModal, SheetProps>(
  ({ children, contentClassName = "", scrollable = false, ...props }, ref) => {
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
        {scrollable ? (
          <StyledBottomSheetScrollView
            contentContainerClassName={cn("gap-4 px-6", contentClassName)}
            contentContainerStyle={{ paddingBottom: bottom + 8 }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </StyledBottomSheetScrollView>
        ) : (
          <StyledBottomSheetView
            className={cn("gap-4 px-6", contentClassName)}
            style={{ paddingBottom: bottom + 8 }}
          >
            {children}
          </StyledBottomSheetView>
        )}
      </BottomSheetModal>
    );
  },
);

BottomSheet.displayName = "Sheet";
