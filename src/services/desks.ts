import { client } from "@core/api";
import { unwrap } from "@core/api/error";
import { components, paths } from "@core/api/generated/schema";

type DeskListResponse =
  paths["/v1/cohorts/{cohortId}/desks"]["get"]["responses"]["200"]["content"]["application/json"];

export type Desk = components["schemas"]["DeskDto"];

export class DeskService {
  /** Every desk on the map, with who holds it in this cohort. */
  static async list(cohortId: string): Promise<DeskListResponse> {
    return unwrap<DeskListResponse>(
      client.GET("/v1/cohorts/{cohortId}/desks", {
        params: { path: { cohortId } },
      }),
    );
  }
}
