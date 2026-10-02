import { AuthService } from "@services/auth";
import { InviteService } from "@services/invite";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useSignInWithGoogle() {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: AuthService.signInWithGoogle,
  });

  return { signInWithGoogle: mutateAsync, isLoading: isPending };
}

export function useLogout() {
  const { mutateAsync } = useMutation({
    mutationFn: AuthService.logout,
  });

  return { logout: mutateAsync };
}

export function useInvitePreview() {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: InviteService.previewInvite,
  });

  return { previewInvite: mutateAsync, isLoading: isPending };
}

export function useInviteDecision() {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: InviteService.decideOnInvite,
  });

  return { decideOnInvite: mutateAsync, isLoading: isPending };
}

export function useInviteValidate({ enabled = true }: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["validateInvite"],
    queryFn: InviteService.validateInvite,
    enabled,
  });
}
