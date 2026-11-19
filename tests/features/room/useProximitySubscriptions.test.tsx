import { renderHook } from "@testing-library/react-native";

import { useProximitySubscriptions } from "../../../src/feature/room/hooks/useProximitySubscriptions";

const mockCtx = {
  call: { hearing: "proximity" } as { hearing: string } | null,
  nearbyUserIds: ["near"],
};

function publication(isDesired: boolean) {
  return { isDesired, setSubscribed: jest.fn() };
}

const mockRemotes: {
  identity: string;
  trackPublications: Map<string, ReturnType<typeof publication>>;
}[] = [];

jest.mock("@livekit/react-native", () => ({
  useRemoteParticipants: () => mockRemotes,
}));

jest.mock("../../../src/feature/room/providers/SpaceCallProvider", () => ({
  useSpaceCallContext: () => mockCtx,
}));

describe("useProximitySubscriptions", () => {
  beforeEach(() => {
    mockRemotes.length = 0;
  });

  it("hears only the people nearby names", async () => {
    const near = publication(false);
    const far = publication(true);
    mockRemotes.push(
      { identity: "near:a", trackPublications: new Map([["mic", near]]) },
      { identity: "far:a", trackPublications: new Map([["mic", far]]) },
    );
    mockCtx.call = { hearing: "proximity" };

    await renderHook(() => useProximitySubscriptions());

    expect(near.setSubscribed).toHaveBeenCalledWith(true);
    expect(far.setSubscribed).toHaveBeenCalledWith(false);
  });

  it("leaves a whole-room call to auto-subscribe", async () => {
    const pub = publication(true);
    mockRemotes.push({
      identity: "far:a",
      trackPublications: new Map([["mic", pub]]),
    });
    mockCtx.call = { hearing: "room" };

    await renderHook(() => useProximitySubscriptions());

    expect(pub.setSubscribed).not.toHaveBeenCalled();
  });
});
