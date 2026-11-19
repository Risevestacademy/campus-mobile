import { isUploadError } from "@services/uploads";
import { toast } from "@shared/components/atoms";
import { useUpload, useUploadLimits } from "@shared/hooks/useUpload";
import * as ImagePicker from "expo-image-picker";
import React from "react";

export type FeedbackAttachment = {
  key: string;
  /** The picked photo, for the thumbnail. */
  uri: string;
  /**
   * uploading: on its way up. ready: can be sent. failed: didn't go up.
   * expired: went up over 30 minutes ago, so it must be added again.
   */
  state: "uploading" | "ready" | "failed" | "expired";
  mediaId?: string;
  attachBy?: number;
};

/** Until the limits load; the API's documented default. */
const DEFAULT_MAX = 10;

let nextKey = 0;

/**
 * Screenshots for a piece of feedback. Each is uploaded as soon as it's
 * picked, so its URL is asked for right before the upload, and `take`
 * hands over the ids to send, in the order they were added.
 */
export function useFeedbackAttachments() {
  const { upload } = useUpload("feedback_attachment");
  const { data: limits } = useUploadLimits();
  const max = limits?.maxAttachments ?? DEFAULT_MAX;
  const [items, setItems] = React.useState<FeedbackAttachment[]>([]);

  const update = (key: string, patch: Partial<FeedbackAttachment>) =>
    // A removed screenshot has no row left to update.
    setItems((list) =>
      list.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );

  const add = async () => {
    const room = max - items.length;
    if (room <= 0) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: room,
      quality: 1,
      exif: false,
    });
    if (result.canceled) return;

    const picked = result.assets.slice(0, room).map((asset) => ({
      asset,
      item: {
        key: `attachment-${nextKey++}`,
        uri: asset.uri,
        state: "uploading" as const,
      },
    }));
    setItems((list) => [...list, ...picked.map(({ item }) => item)]);

    await Promise.all(
      picked.map(async ({ asset, item }) => {
        try {
          const { mediaId, attachBy } = await upload({
            uri: asset.uri,
            fileName: asset.fileName ?? undefined,
            mimeType: asset.mimeType,
          });
          update(item.key, { state: "ready", mediaId, attachBy });
        } catch (error) {
          update(item.key, { state: "failed" });
          toast.error(
            isUploadError(error)
              ? error.message
              : "It didn't upload. Remove it and try again.",
            "Screenshot not added",
          );
        }
      }),
    );
  };

  const remove = (key: string) =>
    setItems((list) => list.filter((item) => item.key !== key));

  /**
   * The ids to send, in order. Null, with the stale ones marked expired,
   * when any went up too long ago to attach; those need adding again.
   */
  const take = (now = Date.now()): string[] | null => {
    const ready = items.filter((item) => item.state === "ready");
    const stale = ready.filter((item) => (item.attachBy ?? 0) <= now);
    if (stale.length > 0) {
      setItems((list) =>
        list.map((item) =>
          stale.includes(item) ? { ...item, state: "expired" } : item,
        ),
      );
      return null;
    }
    return ready.map((item) => item.mediaId!);
  };

  return {
    items,
    add,
    remove,
    take,
    max,
    canAdd: items.length < max,
    isUploading: items.some((item) => item.state === "uploading"),
  };
}
