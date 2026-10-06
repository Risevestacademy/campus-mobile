import { useSessionStore } from "@store/session";
import { Redirect } from "expo-router";

export default function Index() {
  const status = useSessionStore((state) => state.status);
  const hasInvite = useSessionStore((state) => state.hasInvite);

  if (status === "authenticated") {
    if (hasInvite) {
      return <Redirect href="/(auth)/CreatePassword" />;
    }
    return <Redirect href="/(tabs)/(campus)" />;
  }

  return <Redirect href="/SignIn" />;
}
