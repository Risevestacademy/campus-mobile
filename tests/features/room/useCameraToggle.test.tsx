import { act, renderHook } from "@testing-library/react-native";

import { useCameraToggle } from "../../../src/feature/room/hooks/useCameraToggle";

const mockSetCameraEnabled = jest.fn();
const mockLocal = {
  localParticipant: {
    setCameraEnabled: mockSetCameraEnabled,
    permissions: { canPublish: true },
  },
  isCameraEnabled: false,
};

jest.mock("@livekit/react-native", () => ({
  useLocalParticipant: () => mockLocal,
  useConnectionState: () => "connected",
}));

describe("useCameraToggle", () => {
  beforeEach(() => mockSetCameraEnabled.mockReset());

  it("turns the camera on", async () => {
    mockSetCameraEnabled.mockResolvedValue(undefined);
    const { result } = await renderHook(() => useCameraToggle());
    await act(async () => result.current.toggleCamera());
    expect(mockSetCameraEnabled).toHaveBeenCalledWith(true);
    expect(result.current.permissionDenied).toBe(false);
    expect(result.current.canPublish).toBe(true);
  });

  it("flags a denied permission when turning on fails", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    mockSetCameraEnabled.mockRejectedValue(new Error("denied"));
    const { result } = await renderHook(() => useCameraToggle());
    await act(async () => result.current.toggleCamera());
    expect(result.current.permissionDenied).toBe(true);
    await act(async () => result.current.dismissPermissionDenied());
    expect(result.current.permissionDenied).toBe(false);
    warn.mockRestore();
  });
});
