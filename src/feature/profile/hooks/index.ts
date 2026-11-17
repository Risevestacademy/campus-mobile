import { FeedbackService } from "@services/feedback";
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
    // The header reads the name from ["me"] and the desk reads the bio from
    // your member card; refetch every view of the user.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["me"] }),
        queryClient.invalidateQueries({ queryKey: ["user/me"] }),
        queryClient.invalidateQueries({ queryKey: ["profile/member"] }),
      ]),
  });

  return { update, isUpdating };
}

export function useSendFeedback() {
  const { mutateAsync: send, isPending: isSending } = useMutation({
    mutationFn: FeedbackService.send,
  });

  return { send, isSending };
}

/** Waits while `id` is unknown, e.g. until the signed-in user loads. */
export function useGetMemberProfile(id: string | undefined) {
  const { isLoading, data, refetch, error } = useQuery({
    queryKey: ["profile/member", id],
    queryFn: () => ProfileService.viewMemberProfile(id!),
    enabled: Boolean(id),
  });

  return { isLoading, data, refetch, error };
}
