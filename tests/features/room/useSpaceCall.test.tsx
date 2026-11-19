import { act, renderHook } from "@testing-library/react-native";

import {
  joinDeadline,
  useSpaceCall,
} from "../../../src/feature/room/hooks/useSpaceCall";

const mockListeners = new Set<(message: unknown) => void>();
const mockWs = { status: "open" as string, rejoin: jest.fn() };

jest.mock("@shared/hooks/useWs", () => ({
  useWs: () => ({
    status: mockWs.status,
    rejoin: mockWs.rejoin,
    subscribe: (listener: (message: unknown) => void) => {
      mockListeners.add(listener);
      return () => mockListeners.delete(listener);
    },
  }),
}));

const emit = (message: unknown) =>
  act(() => mockListeners.forEach((listener) => listener(message)));

/** A JWT whose payload is `claims`; the signature is never checked. */
function jwt(claims: object) {
  const payload = btoa(JSON.stringify(claims))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `header.${payload}.signature`;
}

const call = (room: string) => ({
  url: "wss://media.example",
  room,
  token: jwt({ exp: 2_000_000_000 }),
  hearing: "room" as const,
  audibleRadius: 0,
  subscribeRadius: 0,
});

async function arrive() {
  const hook = await renderHook(() => useSpaceCall());
  await emit({ type: "welcome", userId: "me", mode: "avatar" });
  await emit({ type: "call", call: call("library") });
  return hook;
}

describe("useSpaceCall", () => {
  beforeEach(() => {
    mockListeners.clear();
    mockWs.status = "open";
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("is in sync with the call world sends on arrival", async () => {
    const { result } = await arrive();

    expect(result.current.call?.room).toBe("library");
    expect(result.current.inSync).toBe(true);
    expect(result.current.joinBy).toBe(2_000_000_000_000);
  });

  it("isn't in sync after you step, until the new space's call comes", async () => {
    const { result } = await arrive();

    await emit({ type: "spaceChanged", userId: "me", spaceKey: "studio" });
    expect(result.current.inSync).toBe(false);

    await emit({ type: "call", call: call("studio") });
    expect(result.current.call?.room).toBe("studio");
    expect(result.current.inSync).toBe(true);
  });

  it("pairs a call that comes before its step", async () => {
    const { result } = await arrive();

    await emit({ type: "call", call: call("studio") });
    expect(result.current.inSync).toBe(false);

    await emit({ type: "spaceChanged", userId: "me", spaceKey: "studio" });
    expect(result.current.inSync).toBe(true);
  });

  it("ignores somebody else stepping", async () => {
    const { result } = await arrive();

    await emit({ type: "spaceChanged", userId: "ada", spaceKey: "studio" });

    expect(result.current.inSync).toBe(true);
  });

  it.each(["watching", "replaced"])(
    "drops the call on %s: only the device standing for you is in it",
    async (type) => {
      const { result } = await arrive();

      await emit({ type });

      expect(result.current.call).toBeNull();
      expect(result.current.inSync).toBe(false);
    },
  );

  it.each(["idle", "refused", "replaced"])(
    "drops the call when the socket is %s",
    async (status) => {
      const { result, rerender } = await arrive();

      mockWs.status = status;
      await rerender({});

      expect(result.current.call).toBeNull();
    },
  );

  it("asks world for fresh credentials by rejoining", async () => {
    const { result } = await arrive();

    result.current.refresh();

    expect(mockWs.rejoin).toHaveBeenCalled();
  });
});

describe("joinDeadline", () => {
  it("reads the token's expiry", () => {
    expect(joinDeadline(jwt({ exp: 1_700_000_000 }))).toBe(1_700_000_000_000);
  });

  it("allows the protocol's ten minutes when the token doesn't say", () => {
    expect(joinDeadline("not-a-jwt", 1_000)).toBe(1_000 + 10 * 60_000);
  });
});
