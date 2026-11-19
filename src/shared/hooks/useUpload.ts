import {
  checkUpload,
  type MediaKind,
  type UploadedFile,
  UploadError,
  UploadService,
} from "@services/uploads";
import { contentTypeOf, REENCODED_IMAGE_TYPES } from "@shared/lib/mime";
import { prepareImage } from "@shared/lib/prepareImage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { File } from "expo-file-system";
import React from "react";

const LIMITS_QUERY = {
  queryKey: ["uploads/limits"],
  queryFn: () => UploadService.limits(),
  // They change with a deploy, not while you use the app.
  staleTime: 60 * 60_000,
} as const;

/** What each kind of upload may be: types, largest size, most attachments. */
export function useUploadLimits() {
  return useQuery(LIMITS_QUERY);
}

export type PickedFile = {
  /** A local `file://` URI from an image or document picker. */
  uri: string;
  /** Its name, for documents and for working out the type. */
  fileName?: string;
  /** The type the picker reported, if any. */
  mimeType?: string | null;
};

/**
 * Uploads one picked file of `kind` and gives back its `mediaId`, to hand to
 * the endpoint that uses it before `attachBy`.
 *
 * Photos are re-encoded first (avatars cropped to 512×512, attachments to a
 * 2560 px long edge); other files are checked against the kind's limits on
 * the device, so a refused type or size never asks for a URL.
 */
export function useUpload(kind: MediaKind) {
  const queryClient = useQueryClient();
  const [progress, setProgress] = React.useState(0);

  const mutation = useMutation({
    mutationFn: async ({
      uri,
      fileName,
      mimeType,
    }: PickedFile): Promise<UploadedFile> => {
      setProgress(0);
      const name = fileName ?? new File(uri).name;
      const reported = contentTypeOf(name, mimeType);

      let file = { uri, contentType: reported, fileName };
      if (
        kind === "avatar" ||
        (reported && REENCODED_IMAGE_TYPES.includes(reported))
      ) {
        const image = await prepareImage(
          uri,
          kind === "avatar" ? "avatar" : "attachment",
        );
        file = {
          uri: image.uri,
          contentType: image.contentType,
          // It's a JPEG now, whatever it was picked as.
          fileName: fileName?.replace(/\.[^.]+$/, ".jpg"),
        };
      }

      const contentType = file.contentType;
      if (!contentType) {
        throw new UploadError(
          "type_not_allowed",
          "This kind of file can't be uploaded here.",
        );
      }
      const limits = await queryClient.query(LIMITS_QUERY);
      const refused = checkUpload(
        limits,
        kind,
        contentType,
        new File(file.uri).size,
      );
      if (refused) throw refused;

      return UploadService.upload({
        kind,
        uri: file.uri,
        contentType,
        fileName: file.fileName,
        onProgress: setProgress,
      });
    },
  });

  return {
    upload: mutation.mutateAsync,
    uploaded: mutation.data,
    isUploading: mutation.isPending,
    progress,
    error: mutation.error,
    reset: mutation.reset,
  };
}
