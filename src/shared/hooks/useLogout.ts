import { AuthService } from "@services/auth";
import { useMutation } from "@tanstack/react-query";

export function useLogout() {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: AuthService.signOut,
  });

  return { logout: mutateAsync, isLoading: isPending };
}
