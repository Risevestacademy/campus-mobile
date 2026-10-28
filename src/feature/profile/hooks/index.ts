import { ProfileService } from "@services/profile";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useProfile() {
  const { data, isLoading, refetch, isRefetching, error } = useQuery({
    queryKey: ["user/me"],
    queryFn: ProfileService.getProfile,
  });

  return { data, isLoading, refetch, isRefetching, error };
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { mutateAsync: update, isPending: isUpdating } = useMutation({
    mutationFn: ProfileService.updateProfile,
    // The header reads the name from ["me"]; refetch both views of the user.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["me"] }),
        queryClient.invalidateQueries({ queryKey: ["user/me"] }),
      ]),
  });

  return { update, isUpdating };
}
