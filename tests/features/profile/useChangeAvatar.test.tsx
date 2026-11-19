import { ApiError } from "@core/api/error";
import { useChangeAvatar } from "@features/profile/hooks";
import { ProfileService } from "@services/profile";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import * as ImagePicker from "expo-image-picker";
import React from "react";

const mockUpload = jest.fn();
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();

jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock("@shared/hooks/useUpload", () => ({
  useUpload: () => ({ upload: mockUpload, progress: 0 }),
}));

jest.mock("@shared/components/atoms", () => ({
  ...jest.requireActual("@shared/components/atoms"),
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

const pick = ImagePicker.launchImageLibraryAsync as jest.Mock;

const photo = {
  uri: "file:///photos/IMG_0001.HEIC",
  fileName: "IMG_0001.HEIC",
  mimeType: "image/heic",
};

let queryClient: QueryClient;

function renderChangeAvatar() {
  queryClient = new QueryClient({
    // No garbage-collection timers left running after the test.
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { gcTime: Infinity },
    },
  });
  return renderHook(() => useChangeAvatar(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

describe("useChangeAvatar", () => {
  let setAvatar: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpload.mockResolvedValue({ mediaId: "media-1", attachBy: 0 });
    setAvatar = jest
      .spyOn(ProfileService, "setAvatar")
      .mockResolvedValue({ avatarUrl: "https://cdn/new.jpg" } as never);
  });

  afterEach(async () => {
    await act(async () => queryClient.clear());
    jest.restoreAllMocks();
  });

  it("does nothing when you close the picker", async () => {
    pick.mockResolvedValue({ canceled: true, assets: null });
    const { result } = await renderChangeAvatar();

    await act(() => result.current.change());

    expect(mockUpload).not.toHaveBeenCalled();
    expect(setAvatar).not.toHaveBeenCalled();
  });

  it("uploads the picked photo and sets it as your picture", async () => {
    pick.mockResolvedValue({ canceled: false, assets: [photo] });
    const { result } = await renderChangeAvatar();

    await act(() => result.current.change());

    expect(pick).toHaveBeenCalledWith(
      expect.objectContaining({ allowsEditing: true, aspect: [1, 1] }),
    );
    expect(mockUpload).toHaveBeenCalledWith(photo);
    expect(setAvatar).toHaveBeenCalledWith("media-1");
    expect(queryClient.getQueryData(["user/me"])).toEqual({
      avatarUrl: "https://cdn/new.jpg",
    });
    expect(mockToastSuccess).toHaveBeenCalledWith("Profile picture updated");
    expect(result.current.preview).toBeNull();
  });

  it("asks you to choose it again when the upload is no longer there", async () => {
    pick.mockResolvedValue({ canceled: false, assets: [photo] });
    setAvatar.mockRejectedValue(
      new ApiError(404, { code: "NOT_FOUND", message: "No upload" }),
    );
    const { result } = await renderChangeAvatar();

    await act(() => result.current.change());

    expect(mockToastError).toHaveBeenCalledWith(
      "That picture didn't go up in time. Choose it again.",
      "Picture not changed",
    );
    expect(result.current.preview).toBeNull();
  });
});
