import { AuthService } from "@services/auth";
import { useQuery } from "@tanstack/react-query";

export function useMe({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["me"],
    queryFn: AuthService.getMe,
    enabled,
  });
}
