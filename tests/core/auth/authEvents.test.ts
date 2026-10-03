import { authEvents } from "@core/auth/authEvents";

describe("authEvents", () => {
  describe("onUnauthenticated", () => {
    it("notifies listeners when emitUnauthenticated is called", () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      const unsubscribe1 = authEvents.onUnauthenticated(listener1);
      const unsubscribe2 = authEvents.onUnauthenticated(listener2);

      authEvents.emitUnauthenticated();

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);

      unsubscribe1();

      authEvents.emitUnauthenticated();

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(2);

      unsubscribe2();
    });

    it("catches errors inside unauthenticated listeners without throwing", () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const faultyListener = jest.fn().mockImplementation(() => {
        throw new Error("Listener error");
      });
      const goodListener = jest.fn();

      const unsub1 = authEvents.onUnauthenticated(faultyListener);
      const unsub2 = authEvents.onUnauthenticated(goodListener);

      expect(() => authEvents.emitUnauthenticated()).not.toThrow();

      expect(goodListener).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error in unauthenticated listener:",
        expect.any(Error),
      );

      unsub1();
      unsub2();
      consoleSpy.mockRestore();
    });
  });

  describe("onSessionRefreshed", () => {
    it("notifies listeners when emitSessionRefreshed is called", () => {
      const listener = jest.fn();

      const unsubscribe = authEvents.onSessionRefreshed(listener);

      authEvents.emitSessionRefreshed();

      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      authEvents.emitSessionRefreshed();

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("catches errors inside sessionRefreshed listeners without throwing", () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const faultyListener = jest.fn().mockImplementation(() => {
        throw new Error("Session refreshed error");
      });

      const unsub = authEvents.onSessionRefreshed(faultyListener);

      expect(() => authEvents.emitSessionRefreshed()).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error in sessionRefreshed listener:",
        expect.any(Error),
      );

      unsub();
      consoleSpy.mockRestore();
    });
  });
});
