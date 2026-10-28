import { client } from "@core/api";
import { ApiError } from "@core/api/error";
import { CalendarService } from "@services/calendar";

describe("CalendarService", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe("getEvents", () => {
    it("asks for the window and returns the events", async () => {
      const events = { connected: true, events: [], truncated: false };
      jest.spyOn(client, "GET").mockResolvedValueOnce({
        data: events,
        response: new Response(),
      } as unknown as ReturnType<typeof client.GET>);

      const result = await CalendarService.getEvents({
        from: "2026-10-26",
        to: "2026-11-02",
      });

      expect(client.GET).toHaveBeenCalledWith("/v1/calendar/events", {
        params: { query: { from: "2026-10-26", to: "2026-11-02" } },
      });
      expect(result).toEqual(events);
    });

    it("throws the API error", async () => {
      jest.spyOn(client, "GET").mockResolvedValueOnce({
        error: { error: { code: "BAD_REQUEST", message: "Window too long" } },
        response: new Response(null, { status: 400 }),
      } as unknown as ReturnType<typeof client.GET>);

      await expect(CalendarService.getEvents()).rejects.toBeInstanceOf(
        ApiError,
      );
    });
  });

  describe("connect", () => {
    it("posts the server auth code", async () => {
      jest.spyOn(client, "POST").mockResolvedValueOnce({
        response: new Response(null, { status: 204 }),
      } as unknown as ReturnType<typeof client.POST>);

      await CalendarService.connect("auth-code");

      expect(client.POST).toHaveBeenCalledWith("/v1/calendar/connect", {
        body: { serverAuthCode: "auth-code" },
      });
    });
  });

  describe("disconnect", () => {
    it("deletes the calendar connection", async () => {
      jest.spyOn(client, "DELETE").mockResolvedValueOnce({
        response: new Response(null, { status: 204 }),
      } as unknown as ReturnType<typeof client.DELETE>);

      await CalendarService.disconnect();

      expect(client.DELETE).toHaveBeenCalledWith("/v1/calendar");
    });
  });
});
