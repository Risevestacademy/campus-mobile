import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

/** avatar: square, 512×512. attachment: long edge at most 2560 px. */
export type ImagePreset = "avatar" | "attachment";

export const AVATAR_SIZE = 512;
export const ATTACHMENT_LONG_EDGE = 2560;

export type PreparedImage = {
  uri: string;
  contentType: "image/jpeg";
  width: number;
  height: number;
};

/** The centred square of a `width`×`height` image. */
export function centreSquare(width: number, height: number) {
  const side = Math.min(width, height);
  return {
    originX: Math.floor((width - side) / 2),
    originY: Math.floor((height - side) / 2),
    width: side,
    height: side,
  };
}

/** The size to scale to so the long edge is at most `longEdge`; null if it fits. */
export function fitLongEdge(width: number, height: number, longEdge: number) {
  if (Math.max(width, height) <= longEdge) return null;
  return width >= height
    ? { width: longEdge, height: null }
    : { width: null, height: longEdge };
}

/**
 * Re-encodes a picked photo as a JPEG ready to upload. Decoding and encoding
 * it afresh turns HEIC/HEIF into JPEG and leaves EXIF behind, location
 * included, so the original file is never sent as it is.
 */
export async function prepareImage(
  uri: string,
  preset: ImagePreset,
): Promise<PreparedImage> {
  const original = await ImageManipulator.manipulate(uri).renderAsync();
  const context = ImageManipulator.manipulate(original);

  if (preset === "avatar") {
    context
      .crop(centreSquare(original.width, original.height))
      .resize({ width: AVATAR_SIZE, height: AVATAR_SIZE });
  } else {
    const size = fitLongEdge(
      original.width,
      original.height,
      ATTACHMENT_LONG_EDGE,
    );
    if (size) context.resize(size);
  }

  const image = await context.renderAsync();
  const saved = await image.saveAsync({
    format: SaveFormat.JPEG,
    compress: preset === "avatar" ? 0.85 : 0.8,
  });
  original.release();
  image.release();

  return {
    uri: saved.uri,
    contentType: "image/jpeg",
    width: saved.width,
    height: saved.height,
  };
}
