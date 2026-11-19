import { ApiError } from "@core/api/error";
import {
  ATTACH_WITHIN_MS,
  checkUpload,
  shouldUploadAgain,
  UploadError,
  UploadService,
} from "@services/uploads";

const mockFile = {
  exists: true,
  size: 48213,
  upload: jest.fn(),
};

jest.mock("expo-file-system", () => ({
  File: jest.fn(() => mockFile),
  UploadType: { BINARY_CONTENT: 0, MULTIPART: 1 },
}));

const ticket = (mediaId: string) => ({
  method: "PUT" as const,
  headers: { "Content-Type": "image/jpeg" },
  mediaId,
  uploadUrl: `https://r2.example/${mediaId}`,
  expiresAt: "2026-11-19T10:10:00.000Z",
});

const input = {
  kind: "avatar" as const,
  uri: "file:///cache/avatar.jpg",
  contentType: "image/jpeg",
};

const limits = {
  maxAttachments: 10,
  kinds: [
    {
      kind: "avatar" as const,
      contentTypes: ["image/jpeg", "image/webp"],
      maxBytes: 2 * 1024 * 1024,
    },
  ],
};

describe("UploadService.upload", () => {
  let create: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFile.exists = true;
    create = jest.spyOn(UploadService, "create");
  });

  afterEach(() => {
    // Puts Date.now and UploadService.create back.
    jest.restoreAllMocks();
  });

  it("asks for a URL for the file's exact size, then PUTs it with the signed headers", async () => {
    jest.spyOn(Date, "now").mockReturnValue(1_000);
    create.mockResolvedValue(ticket("media-1"));
    mockFile.upload.mockResolvedValue({ status: 200, body: "", headers: {} });

    const uploaded = await UploadService.upload(input);

    expect(create).toHaveBeenCalledWith({
      kind: "avatar",
      contentType: "image/jpeg",
      sizeBytes: 48213,
      fileName: undefined,
    });
    expect(mockFile.upload).toHaveBeenCalledWith(
      "https://r2.example/media-1",
      expect.objectContaining({
        httpMethod: "PUT",
        uploadType: 0,
        headers: { "Content-Type": "image/jpeg" },
      }),
    );
    expect(uploaded).toEqual({
      mediaId: "media-1",
      attachBy: 1_000 + ATTACH_WITHIN_MS,
    });
  });

  it("gets a fresh URL and tries once more when storage answers 403", async () => {
    create
      .mockResolvedValueOnce(ticket("expired"))
      .mockResolvedValueOnce(ticket("fresh"));
    mockFile.upload
      .mockResolvedValueOnce({ status: 403, body: "", headers: {} })
      .mockResolvedValueOnce({ status: 200, body: "", headers: {} });

    const uploaded = await UploadService.upload(input);

    expect(create).toHaveBeenCalledTimes(2);
    expect(mockFile.upload).toHaveBeenLastCalledWith(
      "https://r2.example/fresh",
      expect.anything(),
    );
    expect(uploaded.mediaId).toBe("fresh");
  });

  it("gives up after a second 403", async () => {
    create.mockResolvedValue(ticket("media-1"));
    mockFile.upload.mockResolvedValue({ status: 403, body: "", headers: {} });

    await expect(UploadService.upload(input)).rejects.toMatchObject({
      reason: "failed",
      status: 403,
    });
    expect(create).toHaveBeenCalledTimes(2);
  });

  it("turns the API's size refusal into an upload error", async () => {
    create.mockRejectedValue(
      new ApiError(413, { code: "UPLOAD_TOO_LARGE", message: "Too big" }),
    );

    await expect(UploadService.upload(input)).rejects.toMatchObject({
      name: "UploadError",
      reason: "too_large",
    });
    expect(mockFile.upload).not.toHaveBeenCalled();
  });

  it("refuses a file that's gone, without asking for a URL", async () => {
    mockFile.exists = false;

    await expect(UploadService.upload(input)).rejects.toMatchObject({
      reason: "missing",
    });
    expect(create).not.toHaveBeenCalled();
  });

  it("says the upload failed when the network drops", async () => {
    create.mockResolvedValue(ticket("media-1"));
    mockFile.upload.mockRejectedValue(new Error("offline"));

    await expect(UploadService.upload(input)).rejects.toMatchObject({
      reason: "failed",
    });
  });
});

describe("checkUpload", () => {
  it("lets a file through that fits the kind", () => {
    expect(checkUpload(limits, "avatar", "image/jpeg", 100_000)).toBeNull();
  });

  it("refuses a type the kind doesn't take", () => {
    const error = checkUpload(limits, "avatar", "image/heic", 100_000);

    expect(error).toBeInstanceOf(UploadError);
    expect(error?.reason).toBe("type_not_allowed");
  });

  it("refuses a file over the kind's size, naming the limit", () => {
    const error = checkUpload(limits, "avatar", "image/jpeg", 3 * 1024 * 1024);

    expect(error?.reason).toBe("too_large");
    expect(error?.message).toBe("Files here can be up to 2 MB.");
  });
});

describe("shouldUploadAgain", () => {
  it("is true when the upload expired or wasn't what was signed", () => {
    expect(
      shouldUploadAgain(
        new ApiError(404, { code: "NOT_FOUND", message: "No upload" }),
      ),
    ).toBe(true);
    expect(
      shouldUploadAgain(
        new ApiError(422, { code: "UPLOAD_MISMATCH", message: "Mismatch" }),
      ),
    ).toBe(true);
  });

  it("is false for anything else", () => {
    expect(
      shouldUploadAgain(
        new ApiError(401, { code: "UNAUTHORIZED", message: "Sign in" }),
      ),
    ).toBe(false);
    expect(shouldUploadAgain(new Error("offline"))).toBe(false);
  });
});
