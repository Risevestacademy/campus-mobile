type Abortable = { signal: AbortSignal; abort: (reason?: unknown) => void };

/**
 * React Native's AbortController polyfill predates `signal.reason`: it drops
 * the reason given to `abort()`. livekit-client reads it when a join is
 * cancelled mid-way (leaving a space, a new call) and crashes on the missing
 * value with "right operand of 'in' is not an object". Recording the reason
 * before the abort is dispatched gives listeners what the spec promises.
 * Does nothing where `reason` is already supported.
 */
export function polyfillAbortReason() {
  if (typeof AbortController === "undefined") return;
  if ("reason" in AbortSignal.prototype) return;

  const proto = AbortController.prototype as unknown as Abortable;
  const abort = proto.abort;
  proto.abort = function (this: Abortable, reason?: unknown) {
    if (!this.signal.aborted) {
      const error = new Error("This operation was aborted");
      error.name = "AbortError";
      Object.defineProperty(this.signal, "reason", {
        value: reason === undefined ? error : reason,
        configurable: true,
      });
    }
    abort.call(this);
  };
}
