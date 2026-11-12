import { renderHook } from "@testing-library/react-native";

import {
  type RoomParticipant,
  splitStage,
  useRoomParticipants,
} from "../../../src/feature/room/hooks/useRoomParticipants";

const mockCtx = { call: null as unknown, nearbyUserIds: [] as string[] };
const mockParticipants = [
  {
    identity: "me:1",
    name: "Me",
    isSpeaking: false,
    isMicrophoneEnabled: true,
    isLocal: true,
    getTrackPublication: () => ({ isMuted: false, source: "camera" }),
  },
  {
    identity: "u1:a",
    name: "Near",
    isSpeaking: true,
    isMicrophoneEnabled: false,
    isLocal: false,
  },
  {
    identity: "u2:a",
    name: "Far",
    isSpeaking: false,
    isMicrophoneEnabled: true,
    isLocal: false,
  },
];

jest.mock("@livekit/react-native", () => ({
  useParticipants: () => mockParticipants,
}));
jest.mock("../../../src/feature/room/providers/SpaceCallProvider", () => ({
  useSpaceCallContext: () => mockCtx,
}));

describe("useRoomParticipants", () => {
  it("lists everyone in a room space", async () => {
    mockCtx.call = { hearing: "room" };
    const { result } = await renderHook(() => useRoomParticipants());
    expect(result.current.map((p) => p.userId)).toEqual(["me", "u1", "u2"]);
  });

  it("exposes the camera track only while the camera is on", async () => {
    mockCtx.call = { hearing: "room" };
    const { result } = await renderHook(() => useRoomParticipants());
    expect(result.current[0]).toMatchObject({ isCameraOn: true });
    expect(result.current[0]?.cameraTrack).toBeDefined();
    expect(result.current[1]).toMatchObject({ isCameraOn: false });
    expect(result.current[1]?.cameraTrack).toBeUndefined();
  });

  it("keeps only you and nearby people in a proximity space", async () => {
    mockCtx.call = { hearing: "proximity" };
    mockCtx.nearbyUserIds = ["u1"];
    const { result } = await renderHook(() => useRoomParticipants());
    expect(result.current.map((p) => p.userId)).toEqual(["me", "u1"]);
    expect(result.current[1]).toMatchObject({
      isSpeaking: true,
      isMuted: true,
    });
  });
});

describe("splitStage", () => {
  const person = (
    userId: string,
    overrides: Partial<RoomParticipant> = {},
  ): RoomParticipant => ({
    identity: `${userId}:a`,
    userId,
    name: userId,
    isSpeaking: false,
    isMuted: false,
    isLocal: false,
    isCameraOn: false,
    cameraTrack: undefined,
    canPublish: false,
    ...overrides,
  });

  it("features the speaking host and keeps you on the row", () => {
    const stage = splitStage([
      person("me", { isLocal: true }),
      person("host", { canPublish: true }),
      person("guest", { canPublish: true, isSpeaking: true }),
      person("l1"),
    ]);
    expect(stage.featured?.userId).toBe("guest");
    expect(stage.row.map((p) => p.userId)).toEqual(["host", "me"]);
    expect(stage.listeners.map((p) => p.userId)).toEqual(["l1"]);
  });

  it("never drops you when speakers fill the row", () => {
    const stage = splitStage([
      person("s0", { canPublish: true }),
      person("s1", { canPublish: true }),
      person("s2", { canPublish: true }),
      person("s3", { canPublish: true }),
      person("s4", { canPublish: true }),
      person("me", { isLocal: true }),
    ]);
    expect(stage.row).toHaveLength(3);
    expect(stage.row.map((p) => p.userId)).toContain("me");
  });
});
