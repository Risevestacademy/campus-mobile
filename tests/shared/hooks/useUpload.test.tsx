import { UploadService } from "@services/uploads";
import { useUpload } from "@shared/hooks/useUpload";
import { prepareImage } from "@shared/lib/prepareImage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import React from "react";

const mockSizes: Record<string, number> = {};

jest.mock("expo-file-system", () => ({
  File: jest.fn((uri: string) => ({
    name: uri.split("/").pop(),
    size: mockSizes[uri] ?? 0,
  })),
  UploadType: { BINARY_CONTENT: 0, MULTIPART: 1 },
}));

jest.mock("@shared/lib/prepareImage", () => ({
  prepareImage: jest.fn(async () => ({
    uri: "file:///cache/prepared.jpg",
    contentType: "image/jpeg",
    width: 512,
    height: 512,
  })),
}));

const limits = {
  maxAttachments: 10,
  kinds: [
    {
      kind: "avatar" as const,
      contentTypes: ["image/jpeg"],
      maxBytes: 2 * 1024 * 1024,
    },
    {
      kind: "notice_attachment" as const,
      contentTypes: ["image/jpeg", "application/pdf"],
      maxBytes: 25 * 1024 * 1024,
    },
  ],
};

let queryClient: QueryClient;

afterEach(async () => {
  // Nothing from this test may notify React after it ends.
  await act(async () => queryClient.clear());
  jest.restoreAllMocks();
});

function renderUpload(kind: Parameters<typeof useUpload>[0]) {
  queryClient = new QueryClient({
    // No garbage-collection timers left running after the test.
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { gcTime: Infinity },
    },
  });
  return renderHook(() => useUpload(kind), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

describe("useUpload", () => {
  let upload: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSizes["file:///cache/prepared.jpg"] = 90_000;
    mockSizes["file:///docs/Timetable.pdf"] = 300_000;
    mockSizes["file:///docs/huge.pdf"] = 30 * 1024 * 1024;
    jest.spyOn(UploadService, "limits").mockResolvedValue(limits);
    upload = jest
      .spyOn(UploadService, "upload")
      .mockResolvedValue({ mediaId: "media-1", attachBy: 0 });
  });

  it("re-encodes an avatar photo, then uploads the JPEG", async () => {
    const { result } = await renderUpload("avatar");

    let uploaded;
    await act(async () => {
      uploaded = await result.current.upload({
        uri: "file:///photos/IMG_0001.HEIC",
        mimeType: "image/heic",
      });
    });

    expect(prepareImage).toHaveBeenCalledWith(
      "file:///photos/IMG_0001.HEIC",
      "avatar",
    );
    expect(upload).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "avatar",
        uri: "file:///cache/prepared.jpg",
        contentType: "image/jpeg",
      }),
    );
    expect(uploaded).toEqual({ mediaId: "media-1", attachBy: 0 });
  });

  it("re-encodes a photo attachment and renames it .jpg", async () => {
    const { result } = await renderUpload("notice_attachment");

    await act(() =>
      result.current.upload({
        uri: "file:///photos/IMG_0002.HEIC",
        fileName: "IMG_0002.HEIC",
        mimeType: "image/heic",
      }),
    );

    expect(prepareImage).toHaveBeenCalledWith(
      "file:///photos/IMG_0002.HEIC",
      "attachment",
    );
    expect(upload).toHaveBeenCalledWith(
      expect.objectContaining({ fileName: "IMG_0002.jpg" }),
    );
  });

  it("sends a document as it is, typed from its extension", async () => {
    const { result } = await renderUpload("notice_attachment");

    await act(() =>
      result.current.upload({
        uri: "file:///docs/Timetable.pdf",
        fileName: "Timetable.pdf",
        mimeType: "application/octet-stream",
      }),
    );

    expect(prepareImage).not.toHaveBeenCalled();
    expect(upload).toHaveBeenCalledWith(
      expect.objectContaining({
        uri: "file:///docs/Timetable.pdf",
        contentType: "application/pdf",
        fileName: "Timetable.pdf",
      }),
    );
  });

  it("refuses a file over the limit on the device, without asking for a URL", async () => {
    const { result } = await renderUpload("notice_attachment");

    await act(async () => {
      await expect(
        result.current.upload({
          uri: "file:///docs/huge.pdf",
          fileName: "huge.pdf",
          mimeType: "application/pdf",
        }),
      ).rejects.toMatchObject({ reason: "too_large" });
    });

    expect(upload).not.toHaveBeenCalled();
  });

  it("refuses a type nothing can tell", async () => {
    const { result } = await renderUpload("notice_attachment");

    await act(async () => {
      await expect(
        result.current.upload({ uri: "file:///docs/blob", fileName: "blob" }),
      ).rejects.toMatchObject({ reason: "type_not_allowed" });
    });

    expect(upload).not.toHaveBeenCalled();
  });
});
