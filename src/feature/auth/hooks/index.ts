import { AuthService } from "@services/auth";
import { InviteService } from "@services/invite";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useSignInWithGoogle() {
  const { mutateAsync } = useMutation({
    mutationFn: AuthService.signInWithGoogle,
  });

  return { signInWithGoogle: mutateAsync };
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
  const { mutateAsync } = useMutation({
    mutationFn: InviteService.decideOnInvite,
  });

  return { decideOnInvite: mutateAsync };
}

export function useInviteValidate() {
  return useQuery({
    queryKey: ["validateInvite"],
    queryFn: InviteService.validateInvite,
  });
}
