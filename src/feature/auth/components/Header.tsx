import { Image, View } from "react-native";

export default function Header() {
  return (
    <View>
      <View className="mb-6">
        <Image
          source={require("@assets/images/campus-by-rise-logo.png")}
          className="h-12.5 w-43"
          resizeMode="contain"
        />
      </View>

      <View className="mb-6 h-0.5 bg-border-default" />
    </View>
  );
}
