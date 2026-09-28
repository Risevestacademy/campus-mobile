import { UserIcon } from "phosphor-react-native";
import { Image, View } from "react-native";
import { withUniwind } from "uniwind";

import { Text } from "./Text";

type AvatarProps = {
  size?: number;
  imageUrl?: string;
  bg?: string;
  placeholder?: string;
};

const StyledUserIcon = withUniwind(UserIcon);

export function Avatar({ size = 40, imageUrl, bg, placeholder }: AvatarProps) {
  let child;

  if (imageUrl) {
    child = <Image source={{ uri: imageUrl }} className="h-full w-full" />;
  } else if (placeholder) {
    child = <Text color="inverse">{placeholder}</Text>;
  } else {
    child = <StyledUserIcon className="text-text-inverse" />;
  }

  return (
    <View
      className="items-center justify-center overflow-hidden rounded-full bg-action-primary-default"
      style={{
        width: size,
        height: size,
        ...(bg ? { backgroundColor: bg } : {}),
      }}
    >
      {child}
    </View>
  );
}
