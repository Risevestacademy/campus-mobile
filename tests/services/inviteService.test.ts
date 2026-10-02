import { client } from "@core/api";
import { InviteService } from "@services/invite";

describe("InviteService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("previewInvite", () => {
    it("posts invite token and returns preview data", async () => {
      const mockPreviewData = {
        email: "student@example.com",
        cohortRole: "Student",
        invitedBy: { firstName: "Jane" },
        cohort: { name: "Cohort 1", startDate: "2026-09-01T00:00:00Z" },
        track: { name: "Product Design" },
      };

      jest.spyOn(client, "POST").mockResolvedValueOnce({
        data: mockPreviewData,
        response: new Response(),
      } as unknown as ReturnType<typeof client.POST>);

      const result = await InviteService.previewInvite("valid-invite-token");

      expect(client.POST).toHaveBeenCalledWith("/v1/invites/preview", {
        body: { token: "valid-invite-token" },
      });
      expect(result).toEqual(mockPreviewData);
    });
  });

  describe("decideOnInvite", () => {
    it("posts decision and inviteId to endpoint", async () => {
      const mockDecisionResp = { success: true };

      jest.spyOn(client, "POST").mockResolvedValueOnce({
        data: mockDecisionResp,
        response: new Response(),
      } as unknown as ReturnType<typeof client.POST>);

      const result = await InviteService.decideOnInvite({
        token: "token-123",
        decision: "accept",
      });

      expect(client.POST).toHaveBeenCalledWith("/v1/invites/decision", {
        body: { decision: "accept", inviteId: "token-123" },
      });
      expect(result).toEqual(mockDecisionResp);
    });
  });

  describe("validateInvite", () => {
    it("calls validate-user-invite endpoint", async () => {
      const mockValidateData = {
        user: { displayName: "John Doe" },
        cohort: { name: "Cohort 1", startDate: "2026-09-01T00:00:00Z" },
      };

      jest.spyOn(client, "GET").mockResolvedValueOnce({
        data: mockValidateData,
        response: new Response(),
      } as unknown as ReturnType<typeof client.GET>);

      const result = await InviteService.validateInvite();

      expect(client.GET).toHaveBeenCalledWith(
        "/v1/invites/validate-user-invite",
      );
      expect(result).toEqual(mockValidateData);
    });
  });
});
