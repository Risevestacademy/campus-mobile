const BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
  pdf: "application/pdf",
  txt: "text/plain",
  csv: "text/csv",
  md: "text/markdown",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  zip: "application/zip",
};

const GENERIC = "application/octet-stream";

/**
 * A file's type: what the picker reported, unless that's missing or the
 * generic `application/octet-stream` Android often gives, in which case
 * it's worked out from the extension. Undefined when neither says.
 */
export function contentTypeOf(
  fileName: string,
  reported?: string | null,
): string | undefined {
  if (reported && reported !== GENERIC) return reported.split(";")[0]?.trim();
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  return BY_EXTENSION[extension];
}

/**
 * Photo types phones produce that must be re-encoded before upload: HEIC
 * isn't accepted, and every photo carries EXIF, location included.
 */
export const REENCODED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
