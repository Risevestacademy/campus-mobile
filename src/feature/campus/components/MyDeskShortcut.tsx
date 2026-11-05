import { Spinner, Text } from "@shared/components/atoms";
import { deskTarget, useMyDesk } from "@shared/hooks/useDesks";
import { useMySpace, useWorldReady } from "@store/world";
import { Armchair } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { withUniwind } from "uniwind";

import { useDeskPreview, useGoToSpace } from "../hooks";

const StyledArmchair = withUniwind(Armchair);

export function MyDeskShortcut() {
  const desk = useMyDesk();
  const ready = useWorldReady();
  const mySpace = useMySpace();
  const { goToSpace, walkingTo } = useGoToSpace();
  const preview = useDeskPreview();

  const target = (desk ? deskTarget(desk) : null) ?? preview;
  if (!target || !ready) return null;

  if (mySpace?.spaceKey === target.spaceKey) {
    return (
      <View className="mt-3 flex-row items-center gap-1.5 self-start">
        <StyledArmchair
          size={14}
          colorClassName="accent-text-turquoise-fixed"
        />
        <Text variant="body-sm" className="text-text-rail">
          At your desk
        </Text>
      </View>
    );
  }

  const walking = walkingTo === target.spaceKey;

  return (
    <Pressable
      onPress={() => goToSpace(target.spaceKey, target.name)}
      disabled={walking}
      accessibilityRole="button"
      accessibilityLabel={`Go to my desk, ${target.name}`}
      accessibilityState={{ busy: walking, disabled: walking }}
      className="mt-3 flex-row items-center gap-1.5 self-start rounded-full bg-overlay-white-15 px-3 py-1.5 active:opacity-80"
    >
      {walking ? (
        <Spinner size={14} colorClassName="accent-text-on-dark" />
      ) : (
        <StyledArmchair size={14} colorClassName="accent-text-on-dark" />
      )}
      <Text variant="label" className="text-text-on-dark">
        {walking ? "Walking to your desk" : "Go to my desk"}
      </Text>
    </Pressable>
  );
}
