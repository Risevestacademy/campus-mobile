import type { Desk } from "@services/desks";
import { DeskService } from "@services/desks";
import { deskTarget, useMyDesk } from "@shared/hooks/useDesks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

const mockMe = {
  data: {
    user: { id: "me" },
    membership: { cohortId: "cohort-1" } as { cohortId: string } | null,
  },
};

jest.mock("@shared/hooks/useMe", () => ({
  useMe: () => mockMe,
}));

const desk = (key: string, holderId: string | null): Desk => ({
  key,
  mapKey: "campus",
  holder: holderId ? { id: holderId, displayName: holderId } : null,
  claimedAt: holderId ? "2026-11-03T09:00:00.000Z" : null,
});

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useMyDesk", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    mockMe.data.membership = { cohortId: "cohort-1" };
  });

  it("finds the desk you hold", async () => {
    jest
      .spyOn(DeskService, "list")
      .mockResolvedValue([desk("desk_a1", "someone"), desk("desk_a2", "me")]);

    const { result } = await renderHook(() => useMyDesk(), { wrapper });

    await waitFor(() => expect(result.current?.key).toBe("desk_a2"));
    expect(DeskService.list).toHaveBeenCalledWith("cohort-1");
  });

  it("is null when you hold no desk", async () => {
    const list = jest
      .spyOn(DeskService, "list")
      .mockResolvedValue([desk("desk_a1", "someone"), desk("desk_a2", null)]);

    const { result } = await renderHook(() => useMyDesk(), { wrapper });

    await waitFor(() => expect(list).toHaveBeenCalled());
    expect(result.current).toBeNull();
  });

  it("doesn't ask without a cohort", async () => {
    mockMe.data.membership = null;
    const list = jest.spyOn(DeskService, "list");

    const { result } = await renderHook(() => useMyDesk(), { wrapper });

    expect(result.current).toBeNull();
    expect(list).not.toHaveBeenCalled();
  });
});

describe("deskTarget", () => {
  it("has nowhere to walk until the API says where desks are", () => {
    expect(deskTarget(desk("desk_a1", "me"))).toBeNull();
  });
});
