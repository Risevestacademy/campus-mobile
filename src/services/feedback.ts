import { client } from "@core/api";
import { unwrap } from "@core/api/error";
import { components, paths } from "@core/api/generated/schema";

type FeedbackSendResponse =
  paths["/v1/feedback"]["post"]["responses"]["201"]["content"]["application/json"];

export type CreateFeedbackDto = components["schemas"]["CreateFeedbackDto"];

export class FeedbackService {
  /** Members can only send; reading feedback back is admin-only. */
  static async send(body: CreateFeedbackDto): Promise<FeedbackSendResponse> {
    return unwrap<FeedbackSendResponse>(client.POST("/v1/feedback", { body }));
  }
}
