import { client } from "@core/api";
import { unwrap } from "@core/api/error";
import { paths } from "@core/api/generated/schema";

type SignInWithGoogleResponse =
  paths["/v1/auth/google/token"]["post"]["responses"]["200"]["content"]["application/json"];

type GetSignedInUserResponse =
  paths["/v1/auth/me"]["get"]["responses"]["200"]["content"]["application/json"];

export class AuthService {
  static async signInWithGoogle(
    idToken: string,
  ): Promise<SignInWithGoogleResponse | undefined> {
    return unwrap<SignInWithGoogleResponse>(
      client.POST("/v1/auth/google/token", { body: { idToken } }),
    );
  }

  static async getMe(): Promise<GetSignedInUserResponse | undefined> {
    return unwrap<GetSignedInUserResponse>(client.GET("/v1/auth/me"));
  }

  static async logout(): Promise<void> {
    const token = "";

    await client.POST("/v1/auth/logout", {
      body: { refreshToken: token },
    });
  }
}
