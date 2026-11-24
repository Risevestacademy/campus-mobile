import { renderHook } from "@testing-library/react-native";

import { useCallMute } from "../../../src/feature/room/hooks/useCallMute";

const mockMic = {
  canPublish: true,
  micEnabled: true,
  toggleMic: jest.fn(),
  permissionDenied: false,
  dismissPermissionDenied: jest.fn(),
};
let mockConnection = "connected";

jest.mock("@livekit/react-native", () => ({
  useConnectionState: () => mockConnection,
}));
jest.mock("livekit-client", () => ({
  ConnectionState: { Connected: "connected", Disconnected: "disconnected" },
}));
jest.mock("../../../src/feature/room/hooks/useMicToggle", () => ({
  useMicToggle: () => mockMic,
}));

describe("useCallMute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConnection = "connected";
    mockMic.canPublish = true;
    mockMic.micEnabled = true;
    mockMic.permissionDenied = false;
  });

  it("follows the room's mic", async () => {
    const { result, rerender } = await renderHook(() => useCallMute());
    expect(result.current.muted).toBe(false);

    mockMic.micEnabled = false;
    await rerender({});
    expect(result.current.muted).toBe(true);
  });

  it("toggles the mic while connected", async () => {
    const { result } = await renderHook(() => useCallMute());
    expect(result.current.canToggle).toBe(true);

    result.current.toggle();
    expect(mockMic.toggleMic).toHaveBeenCalledTimes(1);
  });

  it("does nothing, rather than fail as a denied permission, when not connected", async () => {
    mockConnection = "disconnected";
    const { result } = await renderHook(() => useCallMute());
    expect(result.current.canToggle).toBe(false);

    result.current.toggle();
    expect(mockMic.toggleMic).not.toHaveBeenCalled();
  });

  it("does nothing when you may not speak", async () => {
    mockMic.canPublish = false;
    const { result } = await renderHook(() => useCallMute());
    expect(result.current.canToggle).toBe(false);

    result.current.toggle();
    expect(mockMic.toggleMic).not.toHaveBeenCalled();
  });

  it("passes on a denied microphone permission", async () => {
    mockMic.permissionDenied = true;
    const { result } = await renderHook(() => useCallMute());
    expect(result.current.permissionDenied).toBe(true);
    expect(result.current.dismissPermissionDenied).toBe(
      mockMic.dismissPermissionDenied,
    );
  });
});
