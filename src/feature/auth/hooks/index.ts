import { AuthService } from "@services/auth";
import { InviteService } from "@services/invite";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useSignInWithGoogle() {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: AuthService.signInWithGoogle,
  });

  return { signInWithGoogle: mutateAsync, isLoading: isPending };
}

export function useLogout() {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: AuthService.signOut,
  });

  return { logout: mutateAsync, isLoading: isPending };
}

export function useMe({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["me"],
    queryFn: AuthService.getMe,
    enabled,
  });
}

export function useInvitePreview() {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: InviteService.previewInvite,
  });

  return { previewInvite: mutateAsync, isLoading: isPending };
}

export function useInviteDecision() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: InviteService.decideOnInvite,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  return { decideOnInvite: mutateAsync, isLoading: isPending };
}

export function useInviteValidate({
  enabled = true,
}: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["validateInvite"],
    queryFn: InviteService.validateInvite,
    enabled,
  });
}
