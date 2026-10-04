import { Image, View } from "react-native";

export default function Header() {
  return (
    <View className="pt-4">
      <Image
        source={require("@assets/images/logo.png")}
        className="size-12.5"
        resizeMode="contain"
      />
    </View>
  );
}
