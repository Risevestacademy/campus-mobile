import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable } from "react-native";
import { withUniwind } from "uniwind";

const StyledChevronLeft = withUniwind(ChevronLeft);

export function Back() {
  const router = useRouter();

  const back = () => {
    if (!router.canGoBack) return;

    router.back();
  };

  return (
    <Pressable
      onPress={back}
      className="size-10 items-center justify-center rounded-full bg-overlay-white-50/50 dark:bg-overlay-white-15/40"
    >
      <StyledChevronLeft colorClassName="accent-text-primary" />
    </Pressable>
  );
}
