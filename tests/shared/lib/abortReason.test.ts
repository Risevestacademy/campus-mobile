import { polyfillAbortReason } from "@shared/lib/abortReason";

/** An AbortController like React Native's polyfill: no `signal.reason`. */
class LegacySignal {
  aborted = false;
  private listeners: ((event: { type: string }) => void)[] = [];
  addEventListener(_type: string, listener: (event: { type: string }) => void) {
    this.listeners.push(listener);
  }
  dispatch() {
    this.aborted = true;
    for (const listener of this.listeners) listener({ type: "abort" });
  }
}

class LegacyController {
  signal = new LegacySignal();
  abort() {
    this.signal.dispatch();
  }
}

describe("polyfillAbortReason", () => {
  const realController = global.AbortController;
  const realSignal = global.AbortSignal;

  beforeEach(() => {
    global.AbortController =
      LegacyController as unknown as typeof AbortController;
    global.AbortSignal = LegacySignal as unknown as typeof AbortSignal;
  });

  afterEach(() => {
    global.AbortController = realController;
    global.AbortSignal = realSignal;
  });

  it("keeps the reason given to abort, for listeners to read", () => {
    polyfillAbortReason();
    const controller = new AbortController();
    let seen: unknown;
    controller.signal.addEventListener("abort", () => {
      seen = controller.signal.reason;
    });

    controller.abort(
      "Abort connection attempt due to user initiated disconnect",
    );

    // What livekit-client reads while handling the abort.
    expect(seen).toBe(
      "Abort connection attempt due to user initiated disconnect",
    );
  });

  it("gives an AbortError when no reason is given", () => {
    polyfillAbortReason();
    const controller = new AbortController();

    controller.abort();

    expect((controller.signal.reason as Error).name).toBe("AbortError");
  });

  it("leaves a controller that already supports reasons alone", () => {
    global.AbortController = realController;
    global.AbortSignal = realSignal;
    const abort = AbortController.prototype.abort;

    polyfillAbortReason();

    expect(AbortController.prototype.abort).toBe(abort);
  });
});
