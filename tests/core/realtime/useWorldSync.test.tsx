import { useWorldSync } from "@core/realtime/useWorldSync";
import type { ServerMessage } from "@shared/lib/ws";
import { useChatStore } from "@store/chat";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import React from "react";

const mockListeners = new Set<(message: ServerMessage) => void>();

jest.mock("@shared/hooks/useWs", () => ({
  useWs: () => ({
    status: "open",
    subscribe: (listener: (message: ServerMessage) => void) => {
      mockListeners.add(listener);
      return () => mockListeners.delete(listener);
    },
  }),
}));

describe("useWorldSync", () => {
  it("refetches desks when world says they changed", async () => {
    const queryClient = new QueryClient();
    const invalidate = jest.spyOn(queryClient, "invalidateQueries");
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    await renderHook(() => useWorldSync(), { wrapper });
    await act(() =>
      mockListeners.forEach((listener) => listener({ type: "desksChanged" })),
    );

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["desks"] });
  });

  it("feeds said lines to the chat store and clears them in a new space", async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    useChatStore.getState().reset();

    await renderHook(() => useWorldSync(), { wrapper });
    const emit = (message: unknown) =>
      act(() => mockListeners.forEach((l) => l(message as ServerMessage)));

    await emit({ type: "welcome", userId: "me" });
    await emit({
      type: "said",
      id: "1",
      userId: "u1",
      spaceKey: "hall",
      text: "hi",
      at: "2026-11-24T10:00:00.000Z",
    });
    expect(useChatStore.getState().lines).toHaveLength(1);

    await emit({ type: "spaceChanged", userId: "u1", spaceKey: "x" });
    expect(useChatStore.getState().lines).toHaveLength(1);

    await emit({ type: "spaceChanged", userId: "me", spaceKey: "x" });
    expect(useChatStore.getState().lines).toHaveLength(0);
  });
});
