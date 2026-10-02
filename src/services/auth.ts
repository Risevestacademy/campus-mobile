import { client } from "@core/api";
import { unwrap } from "@core/api/error";
import { paths } from "@core/api/generated/schema";
import {
  clearAuthTokens,
  getAuthTokens,
  saveAuthTokens,
} from "@core/auth/tokenStorage";

type SignInWithGoogleResponse =
  paths["/v1/auth/google/token"]["post"]["responses"]["200"]["content"]["application/json"];

type GetSignedInUserResponse =
  paths["/v1/auth/me"]["get"]["responses"]["200"]["content"]["application/json"];

export class AuthService {
  static async signInWithGoogle(
    idToken: string,
  ): Promise<SignInWithGoogleResponse | undefined> {
    const data = await unwrap<SignInWithGoogleResponse>(
      client.POST("/v1/auth/google/token", { body: { idToken } }),
    );

    console.warn(data);

    if (data?.accessToken) {
      await saveAuthTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        accessExpiresAt: data.expiresAt,
        refreshExpiresAt: data.refreshExpiresAt,
      });
    }

    return data;
  }

  static async getMe(): Promise<GetSignedInUserResponse | undefined> {
    return unwrap<GetSignedInUserResponse>(client.GET("/v1/auth/me"));
  }

  static async logout(): Promise<void> {
    const tokens = await getAuthTokens();

    if (tokens?.refreshToken) {
      await client.POST("/v1/auth/logout", {
        body: { refreshToken: tokens.refreshToken },
      });
    }

    await clearAuthTokens();
  }
}
