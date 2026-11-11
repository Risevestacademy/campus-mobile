import { useWorldSync } from "@core/realtime/useWorldSync";
import type { ServerMessage } from "@shared/lib/ws";
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
});
