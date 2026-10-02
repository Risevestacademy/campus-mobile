import { client } from "@core/api";
import { unwrap } from "@core/api/error";
import { components, paths } from "@core/api/generated/schema";

type PreviewInviteResponse =
  paths["/v1/invites/preview"]["post"]["responses"]["200"]["content"]["application/json"];

type DecideOnInviteResponse =
  paths["/v1/invites/decision"]["post"]["responses"]["200"]["content"]["application/json"];

type ValidateInviteResponse =
  paths["/v1/invites/validate-user-invite"]["get"]["responses"]["200"]["content"]["application/json"];

type InviteDecision = components["schemas"]["InviteDecision"];

export class InviteService {
  static async previewInvite(token: string): Promise<PreviewInviteResponse> {
    return unwrap<PreviewInviteResponse>(
      client.POST("/v1/invites/preview", {
        body: { token },
      }),
    );
  }

  static async decideOnInvite({
    token,
    decision,
  }: {
    token: string;
    decision: InviteDecision;
  }): Promise<DecideOnInviteResponse> {
    return unwrap<DecideOnInviteResponse>(
      client.POST("/v1/invites/decision", {
        body: { decision, inviteId: token },
      }),
    );
  }

  static async validateInvite(): Promise<ValidateInviteResponse> {
    return unwrap<ValidateInviteResponse>(
      client.GET("/v1/invites/validate-user-invite"),
    );
  }
}
