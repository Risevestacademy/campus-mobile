import { isApiError } from "@core/api/error";
import { FeedbackService } from "@services/feedback";
import { ProfileService } from "@services/profile";
import { isUploadError, shouldUploadAgain } from "@services/uploads";
import { toast } from "@shared/components/atoms";
import { type PickedFile, useUpload } from "@shared/hooks/useUpload";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import React from "react";

export * from "./useFeedbackAttachments";

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

function avatarErrorMessage(error: unknown) {
  if (shouldUploadAgain(error)) {
    return "That picture didn't go up in time. Choose it again.";
  }
  if (isUploadError(error)) return error.message;
  if (isApiError(error) && error.message) return error.message;
  return "Couldn't change your picture. Try again.";
}

/**
 * Picks a photo from the library and makes it your profile picture: it's
 * cropped to a square, uploaded, then set. `preview` is the picked photo
 * while that happens, to show in place of the old one.
 */
export function useChangeAvatar() {
  const queryClient = useQueryClient();
  const { upload, progress } = useUpload("avatar");
  const [preview, setPreview] = React.useState<string | null>(null);

  const { mutateAsync: setAvatar, isPending } = useMutation({
    mutationFn: async (picked: PickedFile) => {
      const { mediaId } = await upload(picked);
      return ProfileService.setAvatar(mediaId);
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(["user/me"], profile);
      // The header and desks show it too.
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["me"] }),
        queryClient.invalidateQueries({ queryKey: ["profile/member"] }),
      ]);
    },
  });

  const change = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      exif: false,
    });
    const asset = result.assets?.[0];
    if (result.canceled || !asset) return;

    setPreview(asset.uri);
    try {
      await setAvatar({
        uri: asset.uri,
        fileName: asset.fileName ?? undefined,
        mimeType: asset.mimeType,
      });
      toast.success("Profile picture updated");
    } catch (error) {
      toast.error(avatarErrorMessage(error), "Picture not changed");
    } finally {
      setPreview(null);
    }
  };

  return { change, isChanging: isPending, preview, progress };
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
