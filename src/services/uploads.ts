import { client } from "@core/api";
import { isApiError, unwrap } from "@core/api/error";
import type { components } from "@core/api/generated/schema";
import { File, UploadType } from "expo-file-system";

export type MediaKind = components["schemas"]["MediaKind"];
export type UploadTicket = components["schemas"]["UploadDto"];
export type UploadLimits = components["schemas"]["UploadLimitsDto"];
export type SignedRead = components["schemas"]["SignedReadDto"];
type CreateUpload = components["schemas"]["CreateUploadDto"];

/**
 * The endpoint that uses a file (`PUT /v1/users/me/avatar`, a notice, some
 * feedback) must get its `mediaId` within this long of `POST /v1/uploads`.
 */
export const ATTACH_WITHIN_MS = 30 * 60_000;

export type UploadFailure =
  /** Bigger than this kind takes. */
  | "too_large"
  /** A type this kind doesn't take. */
  | "type_not_allowed"
  /** The file was moved or deleted before it could be sent. */
  | "missing"
  /** Storage refused the file, or the network dropped. */
  | "failed";

export class UploadError extends Error {
  readonly name = "UploadError";

  constructor(
    readonly reason: UploadFailure,
    message: string,
    /** Storage's HTTP status, when it answered. */
    readonly status?: number,
  ) {
    super(message);
  }
}

export const isUploadError = (e: unknown): e is UploadError =>
  e instanceof UploadError;

/**
 * True when an attach call failed because the upload is no longer there:
 * over 30 minutes old (404), or not what it was signed for (422). Show it as
 * "upload again", not as an error.
 */
export function shouldUploadAgain(error: unknown) {
  if (!isApiError(error)) return false;
  return error.status === 404 || error.code === "UPLOAD_MISMATCH";
}

/** Whether `limits` lets `kind` take a file of this type and size. */
export function checkUpload(
  limits: UploadLimits,
  kind: MediaKind,
  contentType: string,
  sizeBytes: number,
): UploadError | null {
  const rules = limits.kinds.find((k) => k.kind === kind);
  if (!rules) return null;
  if (!rules.contentTypes.includes(contentType)) {
    return new UploadError(
      "type_not_allowed",
      "This kind of file can't be uploaded here.",
    );
  }
  if (sizeBytes > rules.maxBytes) {
    const mb = Math.floor(rules.maxBytes / (1024 * 1024));
    return new UploadError("too_large", `Files here can be up to ${mb} MB.`);
  }
  return null;
}

/** The API's refusals of `POST /v1/uploads`, as upload failures. */
function asUploadError(error: unknown): never {
  if (isApiError(error)) {
    if (error.code === "UPLOAD_TOO_LARGE") {
      throw new UploadError("too_large", error.message);
    }
    if (error.code === "UPLOAD_TYPE_NOT_ALLOWED") {
      throw new UploadError("type_not_allowed", error.message);
    }
  }
  throw error;
}

export type UploadFileInput = {
  kind: MediaKind;
  /** A local `file://` URI, already in its final form (resized, re-encoded). */
  uri: string;
  /** Sent byte for byte as the PUT's `Content-Type`. */
  contentType: string;
  /** Shown with an attachment; ignored for an avatar. */
  fileName?: string;
  /** From 0 to 1 while the file is sent. */
  onProgress?: (fraction: number) => void;
  signal?: AbortSignal;
};

export type UploadedFile = {
  mediaId: string;
  /** Epoch ms; attach it before this or upload again. */
  attachBy: number;
};

export class UploadService {
  /** A URL to PUT one file to, signed for its kind, type and exact size. */
  static async create(body: CreateUpload): Promise<UploadTicket> {
    return unwrap<UploadTicket>(client.POST("/v1/uploads", { body }));
  }

  /** The types and largest size each kind takes. */
  static async limits(): Promise<UploadLimits> {
    return unwrap<UploadLimits>(client.GET("/v1/uploads/limits"));
  }

  /** A fresh 15-minute link to an attachment, after the last one expired. */
  static async mediaUrl(id: string): Promise<SignedRead> {
    return unwrap<SignedRead>(
      client.GET("/v1/media/{id}/url", { params: { path: { id } } }),
    );
  }

  /**
   * Sends a local file to storage and returns its `mediaId`.
   *
   * The URL is asked for only now, for the file's size as it is now: it
   * lasts 10 minutes and is signed for that exact Content-Length. The file
   * goes up from disk, never as a stream, so the native client sets that
   * length. A 403 means the URL expired before the PUT started; that gets
   * one fresh URL and one more try.
   */
  static async upload({
    kind,
    uri,
    contentType,
    fileName,
    onProgress,
    signal,
  }: UploadFileInput): Promise<UploadedFile> {
    const file = new File(uri);
    if (!file.exists) {
      throw new UploadError("missing", "The file isn't there any more.");
    }
    const sizeBytes = file.size;

    for (let attempt = 0; ; attempt++) {
      const askedAt = Date.now();
      const ticket = await UploadService.create({
        kind,
        contentType,
        sizeBytes,
        fileName,
      }).catch(asUploadError);

      let result;
      try {
        result = await file.upload(ticket.uploadUrl, {
          httpMethod: "PUT",
          uploadType: UploadType.BINARY_CONTENT,
          // Exactly as signed: Content-Type with no charset added.
          headers: ticket.headers,
          sessionType: "foreground",
          onProgress: onProgress
            ? ({ bytesSent, totalBytes }) =>
                onProgress(totalBytes > 0 ? bytesSent / totalBytes : 0)
            : undefined,
          signal,
        });
      } catch (error) {
        if (signal?.aborted) throw error;
        throw new UploadError("failed", "The upload didn't go through.");
      }

      if (result.status >= 200 && result.status < 300) {
        return {
          mediaId: ticket.mediaId,
          attachBy: askedAt + ATTACH_WITHIN_MS,
        };
      }
      if (result.status === 403 && attempt === 0) continue;
      throw new UploadError(
        "failed",
        "The upload didn't go through.",
        result.status,
      );
    }
  }
}
