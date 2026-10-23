import { ProfileService } from "@services/profile";
import { useQuery } from "@tanstack/react-query";

export function useProfile() {
  const { data, isLoading, refetch, isRefetching, error } = useQuery({
    queryKey: ["user/me"],
    queryFn: ProfileService.getProfile,
  });

  return { data, isLoading, refetch, isRefetching, error };
}
