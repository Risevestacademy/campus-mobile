import { ProfileService } from "@services/profile";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useProfile() {
  const { data, isLoading, refetch, isRefetching, error } = useQuery({
    queryKey: ["user/me"],
    queryFn: ProfileService.getProfile,
  });

  return { data, isLoading, refetch, isRefetching, error };
}

export function useUpdateProfile() {
  const { mutateAsync: update, isPending: isUpdating } = useMutation({
    mutationFn: ProfileService.updateProfile,
  });

  return { update, isUpdating };
}
