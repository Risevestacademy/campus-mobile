import { CreatePasswordScreen } from "@features/auth";
import { useLocalSearchParams } from "expo-router";

export default function CreatePassword() {
  const { isDeepLinked } = useLocalSearchParams();
  return <CreatePasswordScreen isDeepLinked={isDeepLinked === "true"} />;
}
