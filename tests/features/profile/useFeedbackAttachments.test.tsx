import { useFeedbackAttachments } from "@features/profile/hooks";
import { UploadError } from "@services/uploads";
import { act, renderHook } from "@testing-library/react-native";
import * as ImagePicker from "expo-image-picker";

const mockUpload = jest.fn();
const mockToastError = jest.fn();

jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock("@shared/hooks/useUpload", () => ({
  useUpload: () => ({ upload: mockUpload }),
  useUploadLimits: () => ({ data: { maxAttachments: 3, kinds: [] } }),
}));

jest.mock("@shared/components/atoms", () => ({
  toast: {
    success: jest.fn(),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

const pick = ImagePicker.launchImageLibraryAsync as jest.Mock;

const asset = (name: string) => ({
  uri: `file:///photos/${name}`,
  fileName: name,
  mimeType: "image/png",
});

describe("useFeedbackAttachments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("uploads each picked screenshot and hands over the ids in order", async () => {
    pick.mockResolvedValue({
      canceled: false,
      assets: [asset("a.png"), asset("b.png")],
    });
    mockUpload
      .mockResolvedValueOnce({ mediaId: "media-a", attachBy: Infinity })
      .mockResolvedValueOnce({ mediaId: "media-b", attachBy: Infinity });
    const { result } = await renderHook(() => useFeedbackAttachments());

    await act(() => result.current.add());

    expect(pick).toHaveBeenCalledWith(
      expect.objectContaining({ selectionLimit: 3 }),
    );
    expect(result.current.items.map((item) => item.state)).toEqual([
      "ready",
      "ready",
    ]);
    let ids: string[] | null = null;
    await act(() => {
      ids = result.current.take();
    });
    expect(ids).toEqual(["media-a", "media-b"]);
  });

  it("only offers the room left", async () => {
    pick.mockResolvedValue({
      canceled: false,
      assets: [asset("a.png"), asset("b.png"), asset("c.png")],
    });
    mockUpload.mockResolvedValue({ mediaId: "m", attachBy: Infinity });
    const { result } = await renderHook(() => useFeedbackAttachments());

    await act(() => result.current.add());

    expect(result.current.items).toHaveLength(3);
    expect(result.current.canAdd).toBe(false);
  });

  it("marks one that didn't upload, and says why", async () => {
    pick.mockResolvedValue({ canceled: false, assets: [asset("big.png")] });
    mockUpload.mockRejectedValue(
      new UploadError("too_large", "Files here can be up to 10 MB."),
    );
    const { result } = await renderHook(() => useFeedbackAttachments());

    await act(() => result.current.add());

    expect(result.current.items[0]?.state).toBe("failed");
    expect(mockToastError).toHaveBeenCalledWith(
      "Files here can be up to 10 MB.",
      "Screenshot not added",
    );
  });

  it("won't send screenshots past the 30-minute window", async () => {
    pick.mockResolvedValue({ canceled: false, assets: [asset("old.png")] });
    mockUpload.mockResolvedValue({ mediaId: "media-old", attachBy: 1_000 });
    const { result } = await renderHook(() => useFeedbackAttachments());
    await act(() => result.current.add());

    let ids: string[] | null = [];
    await act(() => {
      ids = result.current.take(2_000);
    });

    expect(ids).toBeNull();
    expect(result.current.items[0]?.state).toBe("expired");
  });

  it("drops a removed screenshot", async () => {
    pick.mockResolvedValue({ canceled: false, assets: [asset("a.png")] });
    mockUpload.mockResolvedValue({ mediaId: "media-a", attachBy: Infinity });
    const { result } = await renderHook(() => useFeedbackAttachments());
    await act(() => result.current.add());

    await act(() => result.current.remove(result.current.items[0]!.key));

    expect(result.current.items).toEqual([]);
  });
});
