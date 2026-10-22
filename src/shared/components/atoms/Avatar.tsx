import { UserIcon } from "phosphor-react-native";
import { Image, View } from "react-native";
import { withUniwind } from "uniwind";

import { Text } from "./Text";

export type AvatarProps = {
  size?: number;
  imageUrl?: string;
  bg?: string;
  placeholder?: string;
  placeholderClassName?: string;
};

const StyledUserIcon = withUniwind(UserIcon);

export function Avatar({
  size = 40,
  imageUrl,
  bg,
  placeholder,
  placeholderClassName,
}: AvatarProps) {
  let child;

  if (imageUrl) {
    child = <Image source={{ uri: imageUrl }} className="h-full w-full" />;
  } else if (placeholder) {
    child = (
      <Text variant="overline" color="inverse" className={placeholderClassName}>
        {placeholder}
      </Text>
    );
  } else {
    child = <StyledUserIcon colorClassName="accent-text-inverse" />;
  }

  return (
    <View
      className="items-center justify-center overflow-hidden rounded-full bg-action-primary"
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
