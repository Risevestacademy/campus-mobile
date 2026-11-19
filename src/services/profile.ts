import { client } from "@core/api";
import { unwrap } from "@core/api/error";
import { components, paths } from "@core/api/generated/schema";

type ProfileGetResponse =
  paths["/v1/users/me"]["get"]["responses"]["200"]["content"]["application/json"];
type ProfileUpdateResponse =
  paths["/v1/users/me"]["patch"]["responses"]["200"]["content"]["application/json"];
type ProfileViewResponse =
  paths["/v1/users/{id}/profile"]["get"]["responses"]["200"]["content"]["application/json"];
type CohortPeopleResponse =
  paths["/v1/cohorts/{id}/profiles"]["get"]["responses"]["200"]["content"]["application/json"];

type ProfileUpdateDto = components["schemas"]["UpdateProfileDto"];

export class ProfileService {
  static async getProfile(): Promise<ProfileGetResponse> {
    return unwrap<ProfileGetResponse>(client.GET("/v1/users/me"));
  }

  static async updateProfile(
    data?: ProfileUpdateDto,
  ): Promise<ProfileUpdateResponse> {
    return unwrap<ProfileUpdateResponse>(
      client.PATCH("/v1/users/me", { body: data ?? {} }),
    );
  }

  /** Sets an uploaded picture (kind `avatar`) as yours, within 30 minutes of uploading it. */
  static async setAvatar(mediaId: string): Promise<ProfileGetResponse> {
    return unwrap<ProfileGetResponse>(
      client.PUT("/v1/users/me/avatar", { body: { mediaId } }),
    );
  }

  static async viewMemberProfile(id: string): Promise<ProfileViewResponse> {
    return unwrap<ProfileViewResponse>(
      client.GET("/v1/users/{id}/profile", { params: { path: { id } } }),
    );
  }

  static async listCohortPeople(
    cohortId: string,
  ): Promise<CohortPeopleResponse> {
    return unwrap<CohortPeopleResponse>(
      client.GET("/v1/cohorts/{id}/profiles", {
        params: { path: { id: cohortId } },
      }),
    );
  }
}
