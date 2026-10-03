import { useSessionStore } from "@store/session";
import { Redirect } from "expo-router";

export default function Index() {
  const status = useSessionStore((state) => state.status);

  if (status === "authenticated") {
    return <Redirect href="/(tabs)/(campus)" />;
  }

  return <Redirect href="/(auth)/SignIn" />;
}
