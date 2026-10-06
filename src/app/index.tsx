import { useSessionStore } from "@store/session";
import { Redirect } from "expo-router";

export default function Index() {
  const status = useSessionStore((state) => state.status);
  const hasInvite = useSessionStore((state) => state.hasInvite);

  if (status === "loading") {
    return null;
  }

  if (status === "authenticated" && !hasInvite) {
    return <Redirect href="/(tabs)/(campus)" />;
  }

  return <Redirect href="/SignIn" />;
}
