import { client } from "@core/api";
import { unwrap } from "@core/api/error";
import { components, paths } from "@core/api/generated/schema";

type ProfileGetResponse =
  paths["/v1/users/me"]["get"]["responses"]["200"]["content"]["application/json"];
type ProfileUpdateResponse =
  paths["/v1/users/me"]["patch"]["responses"]["200"]["content"]["application/json"];
type ProfileViewResponse =
  paths["/v1/users/{id}/profile"]["get"]["responses"]["200"]["content"]["application/json"];

type ProfileUpdateDto = components["schemas"]["UpdateProfileDto"];

export class ProfileService {
  static async getProfile(): Promise<ProfileGetResponse> {
    return unwrap<ProfileGetResponse>(client.GET("/v1/users/me"));
  }

  async updateProfile(data?: ProfileUpdateDto): Promise<ProfileUpdateResponse> {
    return unwrap<ProfileUpdateResponse>(
      client.PATCH("/v1/users/me", { body: data ?? {} }),
    );
  }

  async viewMemberProfile(id: string): Promise<ProfileViewResponse> {
    return unwrap<ProfileViewResponse>(
      client.GET("/v1/users/{id}/profile", { params: { path: { id } } }),
    );
  }
}
