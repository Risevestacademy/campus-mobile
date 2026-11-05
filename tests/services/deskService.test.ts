import { client } from "@core/api";
import { ApiError } from "@core/api/error";
import { DeskService } from "@services/desks";

describe("DeskService", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("lists the cohort's desks", async () => {
    const desks = [
      { key: "desk_a1", mapKey: "campus", holder: null, claimedAt: null },
    ];
    jest.spyOn(client, "GET").mockResolvedValueOnce({
      data: desks,
      response: new Response(),
    } as unknown as ReturnType<typeof client.GET>);

    const result = await DeskService.list("cohort-1");

    expect(client.GET).toHaveBeenCalledWith("/v1/cohorts/{cohortId}/desks", {
      params: { path: { cohortId: "cohort-1" } },
    });
    expect(result).toEqual(desks);
  });

  it("throws the API error", async () => {
    jest.spyOn(client, "GET").mockResolvedValueOnce({
      error: { error: { code: "FORBIDDEN", message: "Not a member" } },
      response: new Response(null, { status: 403 }),
    } as unknown as ReturnType<typeof client.GET>);

    await expect(DeskService.list("cohort-1")).rejects.toBeInstanceOf(ApiError);
  });
});
